import { NextResponse } from 'next/server';
import { writeFile, mkdir, stat, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { getServerAuthSession } from '~/server/auth';
import { 
  isMinioConfigured, 
  uploadFile, 
  listFiles, 
  getContentType 
} from '~/server/storage';

// Lazy load sharp to avoid crashes if the binary is incompatible
let sharpModule: typeof import('sharp') | null = null;
async function getSharp() {
  if (sharpModule === null) {
    try {
      sharpModule = (await import('sharp')).default;
    } catch (error) {
      console.error('Failed to load sharp:', error);
      return null;
    }
  }
  return sharpModule;
}

export const runtime = 'nodejs';

// Allowed file extensions for security
const ALLOWED_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg',
  'heic', 'heif', // iPhone formats - will be converted
  'mp4', 'webm', 'ogg',
  'pdf', 'doc', 'docx',
]);

// Extensions that need conversion to web-friendly formats
const CONVERT_TO_PNG = new Set(['heic', 'heif']);
const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'heic', 'heif']);

// Max file size: 25MB (larger to accommodate raw iPhone photos)
const MAX_FILE_SIZE = 25 * 1024 * 1024;

// Image optimization settings
const MAX_IMAGE_DIMENSION = 2400; // Max width/height
const JPEG_QUALITY = 85;
const PNG_COMPRESSION = 9;
const WEBP_QUALITY = 85;

async function ensureUploadsDir(dir: string) {
  try {
    const s = await stat(dir);
    if (!s.isDirectory()) throw new Error('uploads is not a directory');
  } catch {
    await mkdir(dir, { recursive: true });
  }
}

/**
 * Process and optimize images
 * - Converts HEIC/HEIF to PNG
 * - Resizes large images
 * - Optimizes file size
 */
async function processImage(
  buffer: Buffer, 
  ext: string,
  outputFormat?: 'png' | 'jpeg' | 'webp'
): Promise<{ buffer: Buffer; ext: string; contentType: string } | null> {
  const sharp = await getSharp();
  if (!sharp) {
    // Sharp not available, return null to skip processing
    return null;
  }

  const needsConversion = CONVERT_TO_PNG.has(ext);
  const targetFormat = outputFormat ?? (needsConversion ? 'png' : ext);
  
  let pipeline = sharp(buffer, {
    // Enable HEIF/HEIC support
    failOn: 'none',
  });

  // Get image metadata
  const metadata = await pipeline.metadata();
  
  // Resize if too large (maintain aspect ratio)
  if (metadata.width && metadata.width > MAX_IMAGE_DIMENSION) {
    pipeline = pipeline.resize(MAX_IMAGE_DIMENSION, undefined, {
      withoutEnlargement: true,
      fit: 'inside',
    });
  } else if (metadata.height && metadata.height > MAX_IMAGE_DIMENSION) {
    pipeline = pipeline.resize(undefined, MAX_IMAGE_DIMENSION, {
      withoutEnlargement: true,
      fit: 'inside',
    });
  }

  // Convert to target format with optimization
  let outputBuffer: Buffer;
  let outputExt: string;
  let contentType: string;

  switch (targetFormat) {
    case 'jpeg':
    case 'jpg':
      outputBuffer = await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
      outputExt = 'jpg';
      contentType = 'image/jpeg';
      break;
    case 'webp':
      outputBuffer = await pipeline.webp({ quality: WEBP_QUALITY }).toBuffer();
      outputExt = 'webp';
      contentType = 'image/webp';
      break;
    case 'png':
    default:
      outputBuffer = await pipeline.png({ compressionLevel: PNG_COMPRESSION }).toBuffer();
      outputExt = 'png';
      contentType = 'image/png';
      break;
  }

  return { buffer: outputBuffer, ext: outputExt, contentType };
}

export async function GET() {
  try {
    const session = await getServerAuthSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Use Minio if configured, otherwise use local storage
    if (isMinioConfigured) {
      try {
        const items = await listFiles();
        return NextResponse.json({ items, storage: 'minio' });
      } catch (error) {
        console.error('Minio list error:', error);
        return NextResponse.json({ error: 'Failed to list files from storage', items: [] }, { status: 500 });
      }
    }

    // Fallback to local storage
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    await ensureUploadsDir(uploadsDir);
    const files = await readdir(uploadsDir);
    const items = files
      .filter((f) => !f.startsWith('.'))
      .map((f) => ({ filename: f, url: `/uploads/${f}` }));
    return NextResponse.json({ items, storage: 'local' });
  } catch (error) {
    console.error('GET /api/media/upload error:', error);
    return NextResponse.json({ error: 'Internal server error', items: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerAuthSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const form = await request.formData();
    const file = form.get('file');
    const convertTo = form.get('convertTo') as string | null;
    
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 25MB.' }, { status: 400 });
    }

    // Validate file extension
    const ext = file.name.includes('.') ? file.name.split('.').pop() : '';
    const safeExt = (ext || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (!safeExt || !ALLOWED_EXTENSIONS.has(safeExt)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
    }

    let buffer: Buffer = Buffer.from(await file.arrayBuffer());
    let finalExt = safeExt;
    let contentType = getContentType(safeExt);
    let wasConverted = false;

    // Process images (convert HEIC/HEIF, optimize, resize)
    if (IMAGE_EXTENSIONS.has(safeExt) && safeExt !== 'svg' && safeExt !== 'gif') {
      try {
        const targetFormat = convertTo as 'png' | 'jpeg' | 'webp' | undefined;
        const processed = await processImage(buffer, safeExt, targetFormat);
        if (processed) {
          buffer = Buffer.from(processed.buffer);
          finalExt = processed.ext;
          contentType = processed.contentType;
          wasConverted = safeExt !== finalExt;
        } else if (CONVERT_TO_PNG.has(safeExt)) {
          return NextResponse.json({ error: 'HEIC/HEIF conversion not available. Please convert to PNG/JPEG first.' }, { status: 400 });
        }
      } catch (error) {
        console.error('Image processing error:', error);
        if (CONVERT_TO_PNG.has(safeExt)) {
          return NextResponse.json({ error: 'Failed to convert HEIC/HEIF image. Please convert to PNG/JPEG first.' }, { status: 400 });
        }
      }
    }

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${finalExt}`;

    // Use Minio if configured, otherwise use local storage
    if (isMinioConfigured) {
      try {
        const url = await uploadFile(buffer, filename, contentType);
        return NextResponse.json({ 
          url, 
          filename, 
          storage: 'minio',
          converted: wasConverted,
          originalFormat: wasConverted ? safeExt : undefined,
        });
      } catch (error) {
        console.error('Minio upload error:', error);
        return NextResponse.json({ error: 'Failed to upload to storage' }, { status: 500 });
      }
    }

    // Fallback to local storage
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    await ensureUploadsDir(uploadsDir);
    const filepath = join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    const url = `/uploads/${filename}`;
    return NextResponse.json({ 
      url, 
      filename, 
      storage: 'local',
      converted: wasConverted,
      originalFormat: wasConverted ? safeExt : undefined,
    });
  } catch (error) {
    console.error('POST /api/media/upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


