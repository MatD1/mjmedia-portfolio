import { NextResponse } from 'next/server';
import { writeFile, mkdir, stat, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { getServerAuthSession } from '~/server/auth';

export const runtime = 'nodejs';

async function ensureUploadsDir(dir: string) {
  try {
    const s = await stat(dir);
    if (!s.isDirectory()) throw new Error('uploads is not a directory');
  } catch {
    await mkdir(dir, { recursive: true });
  }
}

export async function GET() {
  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  await ensureUploadsDir(uploadsDir);
  const files = await readdir(uploadsDir);
  const items = files
    .filter((f) => !f.startsWith('.'))
    .map((f) => ({ filename: f, url: `/uploads/${f}` }));
  return NextResponse.json({ items });
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

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
  const safeExt = (ext || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;

  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  await ensureUploadsDir(uploadsDir);
  const filepath = join(uploadsDir, filename);
  await writeFile(filepath, buffer);

  const url = `/uploads/${filename}`;
  return NextResponse.json({ url, filename });
}


