import { NextRequest, NextResponse } from 'next/server';
import { getS3Client, bucketName } from '~/server/storage';

export async function GET(request: NextRequest) {
  try {
    // Extract filename from URL path
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const encodedFilename = pathParts[pathParts.length - 1]; // Get the last part
    
    if (!encodedFilename) {
      console.error('[Media Proxy Alt] No filename in path:', url.pathname);
      return new NextResponse('Filename is required', { status: 400 });
    }

    // Decode the filename
    const filename = decodeURIComponent(encodedFilename);
    
    console.log(`[Media Proxy Alt] URL: ${request.url}`);
    console.log(`[Media Proxy Alt] Path: ${url.pathname}`);
    console.log(`[Media Proxy Alt] Encoded filename: "${encodedFilename}"`);
    console.log(`[Media Proxy Alt] Decoded filename: "${filename}"`);

    // Get S3 client
    const client = await getS3Client();
    if (!client) {
      console.error('[Media Proxy Alt] Storage not configured');
      return new NextResponse('Storage not configured', { status: 500 });
    }

    // Import GetObjectCommand dynamically
    const { GetObjectCommand } = await import('@aws-sdk/client-s3');

    // Get the file from MinIO
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: filename,
    });

    console.log(`[Media Proxy Alt] Requesting from bucket "${bucketName}" with key "${filename}"`);

    const response = await client.send(command);

    if (!response.Body) {
      console.log(`[Media Proxy Alt] File not found: "${filename}"`);
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

    console.log(`[Media Proxy Alt] Successfully serving "${filename}" (${contentType})`);

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
    console.error('[Media Proxy Alt] Error serving image:', error);
    return new NextResponse(`Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}