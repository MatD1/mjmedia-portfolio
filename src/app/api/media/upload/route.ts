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

export const runtime = 'nodejs';

// Allowed file extensions for security
const ALLOWED_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg',
  'mp4', 'webm', 'ogg',
  'pdf', 'doc', 'docx',
]);

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

async function ensureUploadsDir(dir: string) {
  try {
    const s = await stat(dir);
    if (!s.isDirectory()) throw new Error('uploads is not a directory');
  } catch {
    await mkdir(dir, { recursive: true });
  }
}

export async function GET() {
  const session = await getServerAuthSession();
  if (!session || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Use Minio if configured, otherwise use local storage
  if (isMinioConfigured) {
    try {
      const items = await listFiles();
      return NextResponse.json({ items, storage: 'minio' });
    } catch (error) {
      console.error('Minio list error:', error);
      return new NextResponse('Failed to list files from storage', { status: 500 });
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
}

export async function POST(request: Request) {
  const session = await getServerAuthSession();
  if (!session || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const form = await request.formData();
  const file = form.get('file');
  if (!file || !(file instanceof File)) {
    return new NextResponse('No file provided', { status: 400 });
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return new NextResponse('File too large. Maximum size is 10MB.', { status: 400 });
  }

  // Validate file extension
  const ext = file.name.includes('.') ? file.name.split('.').pop() : '';
  const safeExt = (ext || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  
  if (!safeExt || !ALLOWED_EXTENSIONS.has(safeExt)) {
    return new NextResponse('File type not allowed', { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;

  // Use Minio if configured, otherwise use local storage
  if (isMinioConfigured) {
    try {
      const contentType = getContentType(safeExt);
      const url = await uploadFile(buffer, filename, contentType);
      return NextResponse.json({ url, filename, storage: 'minio' });
    } catch (error) {
      console.error('Minio upload error:', error);
      return new NextResponse('Failed to upload to storage', { status: 500 });
    }
  }

  // Fallback to local storage
  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  await ensureUploadsDir(uploadsDir);
  const filepath = join(uploadsDir, filename);
  await writeFile(filepath, buffer);

  const url = `/uploads/${filename}`;
  return NextResponse.json({ url, filename, storage: 'local' });
}


