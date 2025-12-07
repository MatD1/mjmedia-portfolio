import { NextResponse } from 'next/server';
import { listFiles } from '~/server/storage';
import { getServerAuthSession } from '~/server/auth';

export async function GET() {
  try {
    const session = await getServerAuthSession();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    console.log('[MinIO Debug] Starting file list...');
    const items = await listFiles();
    console.log('[MinIO Debug] Found items:', items.length);
    
    // Test each URL for accessibility
    const testResults = await Promise.allSettled(
      items.map(async (item) => {
        try {
          console.log(`[MinIO Debug] Testing URL: ${item.url}`);
          // Just test if the URL is well-formed and accessible
          const url = new URL(item.url);
          return {
            filename: item.filename,
            url: item.url,
            urlValid: true,
            host: url.host,
            protocol: url.protocol
          };
        } catch (error) {
          console.error(`[MinIO Debug] Invalid URL for ${item.filename}:`, error);
          return {
            filename: item.filename,
            url: item.url,
            urlValid: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      })
    );

    const results = testResults.map((result, index) => 
      result.status === 'fulfilled' ? result.value : { 
        filename: items[index]?.filename || 'unknown',
        error: result.reason 
      }
    );

    return NextResponse.json({ 
      items,
      debug: results,
      totalItems: items.length 
    });
  } catch (error) {
    console.error('[MinIO Debug] Error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      items: []
    }, { status: 500 });
  }
}