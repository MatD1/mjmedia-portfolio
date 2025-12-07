import { NextResponse } from 'next/server';
import { listFiles } from '~/server/storage';
import { getServerAuthSession } from '~/server/auth';

export async function GET() {
  try {
    const session = await getServerAuthSession();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const items = await listFiles();
    
    // Debug information about each file
    const debugInfo = items.map(item => ({
      filename: item.filename,
      encodedFilename: encodeURIComponent(item.filename),
      url: item.url,
      // Show the hex representation of the filename to see special characters
      filenameHex: Buffer.from(item.filename, 'utf8').toString('hex'),
      // Show each character code
      charCodes: Array.from(item.filename).map(char => ({
        char,
        code: char.charCodeAt(0),
        hex: char.charCodeAt(0).toString(16)
      }))
    }));

    return NextResponse.json({ 
      message: 'File list with debug info',
      totalFiles: items.length,
      files: debugInfo
    });
  } catch (error) {
    console.error('[File Debug] Error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}