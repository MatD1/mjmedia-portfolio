import { NextRequest, NextResponse } from 'next/server';
import { getS3Client, bucketName } from '~/server/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const resolvedParams = await params;
    console.log('[Media Proxy] Raw params:', resolvedParams);
    console.log('[Media Proxy] Request URL:', request.url);
    
    // Decode the filename properly to handle special characters and spaces
    const rawFilename = resolvedParams.filename;
    const filename = rawFilename ? decodeURIComponent(rawFilename) : null;
    
    console.log(`[Media Proxy] Raw filename: "${rawFilename}"`);
    console.log(`[Media Proxy] Decoded filename: "${filename}"`);
    
    if (!filename) {
      console.error('[Media Proxy] Filename is required. Received params:', resolvedParams);
      return new NextResponse('Filename is required', { status: 400 });
    }

    console.log(`[Media Proxy] Attempting to serve file: "${filename}"`);

    // Get S3 client
    const client = await getS3Client();
    if (!client) {
      console.error('[Media Proxy] Storage not configured');
      return new NextResponse('Storage not configured', { status: 500 });
    }

    // Import GetObjectCommand dynamically
    const { GetObjectCommand } = await import('@aws-sdk/client-s3');

    // Get the file from MinIO
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: filename,
    });

    console.log(`[Media Proxy] Requesting from bucket "${bucketName}" with key "${filename}"`);

    const response = await client.send(command);

    if (!response.Body) {
      return new NextResponse('File not found', { status: 404 });
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    const reader = response.Body.transformToWebStream().getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const buffer = Buffer.concat(chunks);

    // Determine content type from filename if not provided by S3
    let contentType = response.ContentType || 'application/octet-stream';
    
    if (contentType === 'application/octet-stream') {
      // Try to determine from file extension
      const ext = filename.toLowerCase().split('.').pop();
      switch (ext) {
        case 'jpg':
        case 'jpeg':
          contentType = 'image/jpeg';
          break;
        case 'png':
          contentType = 'image/png';
          break;
        case 'gif':
          contentType = 'image/gif';
          break;
        case 'webp':
          contentType = 'image/webp';
          break;
        case 'svg':
          contentType = 'image/svg+xml';
          break;
        case 'avif':
          contentType = 'image/avif';
          break;
        default:
          contentType = 'application/octet-stream';
      }
    }

    // Return the file with proper headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}