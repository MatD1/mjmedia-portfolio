import { NextRequest, NextResponse } from 'next/server';
import { getS3Client, bucketName } from '~/server/storage';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string[] }> }
) {
  try {
    // Await params in Next.js 15+
    const params = await context.params;
    
    // Handle catch-all route - filename is an array of path segments
    const filenameParts = params.filename;
    
    if (!filenameParts || filenameParts.length === 0) {
      console.error('[Media Proxy Alt] No filename in path');
      return new NextResponse('Filename is required', { status: 400 });
    }

    // Join the filename parts and decode (handles multiple segments and special characters)
    const encodedFilename = filenameParts.join('/');
    let filename: string;
    
    try {
      // Decode the filename - may need multiple passes if double-encoded
      filename = decodeURIComponent(encodedFilename);
      // If still encoded (contains %), try decoding again (handles double-encoding)
      if (filename.includes('%')) {
        try {
          filename = decodeURIComponent(filename);
        } catch {
          // If second decode fails, use first decode result
        }
      }
    } catch (decodeError) {
      // If decoding fails, use the original
      console.warn('[Media Proxy Alt] Decode error, using original:', decodeError);
      filename = encodedFilename;
    }
    
    console.log(`[Media Proxy Alt] Request URL: ${request.url}`);
    console.log(`[Media Proxy Alt] Filename parts:`, filenameParts);
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
    console.log(`[Media Proxy Alt] Environment: ${process.env.NODE_ENV}`);
    console.log(`[Media Proxy Alt] Timestamp: ${new Date().toISOString()}`);

    // Add timeout wrapper for Railway (60s limit, but we'll timeout at 25s to fail fast)
    const TIMEOUT_MS = 25000; // 25 seconds
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${TIMEOUT_MS}ms - Railway may have networking issues`));
      }, TIMEOUT_MS);
    });

    let response;
    try {
      response = await Promise.race([
        client.send(command),
        timeoutPromise,
      ]);
    } catch (timeoutError) {
      console.error(`[Media Proxy Alt] Timeout or error fetching from Minio:`, timeoutError);
      const errorMessage = timeoutError instanceof Error ? timeoutError.message : 'Unknown error';
      
      // Check if it's a timeout
      if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
        return new NextResponse(
          JSON.stringify({ 
            error: 'Request timeout', 
            message: 'The Minio service did not respond in time. This may indicate a networking issue in production.',
            details: errorMessage 
          }),
          { 
            status: 504, // Gateway Timeout
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      // Re-throw other errors to be caught by outer catch
      throw timeoutError;
    }

    if (!response.Body) {
      console.log(`[Media Proxy Alt] File not found: "${filename}"`);
      return new NextResponse('File not found', { status: 404 });
    }

    // Convert stream to buffer
    // Handle both Readable and ReadableStream
    let buffer: Buffer;
    if (response.Body instanceof ReadableStream) {
      const chunks: Uint8Array[] = [];
      const reader = response.Body.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }

      buffer = Buffer.concat(chunks);
    } else if (response.Body && typeof (response.Body as any).transformToWebStream === 'function') {
      // AWS SDK v3 style
      const chunks: Uint8Array[] = [];
      const reader = (response.Body as any).transformToWebStream().getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }

      buffer = Buffer.concat(chunks);
    } else {
      // Fallback: try to read as buffer directly
      const stream = response.Body as any;
      const chunks: Buffer[] = [];
      
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }
      
      buffer = Buffer.concat(chunks);
    }

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

    console.log(`[Media Proxy Alt] Successfully serving "${filename}" (${contentType}, ${buffer.length} bytes)`);

    // Return the file with proper headers for Next.js Image optimization
    // NextResponse accepts Buffer, but TypeScript needs explicit typing
    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        // Important: Ensure Next.js Image optimization recognizes this as an image
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('[Media Proxy Alt] Error serving image:', errorMessage);
    console.error('[Media Proxy Alt] Error stack:', errorStack);
    console.error('[Media Proxy Alt] Environment:', process.env.NODE_ENV);
    console.error('[Media Proxy Alt] Timestamp:', new Date().toISOString());
    
    // Check for specific error types
    if (errorMessage.includes('timeout') || errorMessage.includes('Timeout') || errorMessage.includes('ETIMEDOUT')) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Gateway Timeout',
          message: 'The Minio service did not respond in time. This may indicate a networking issue.',
          details: errorMessage 
        }),
        { 
          status: 504,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ENOTFOUND')) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Connection Failed',
          message: 'Cannot connect to Minio service. Please check your MINIMO_API_URL configuration.',
          details: errorMessage 
        }),
        { 
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error',
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorStack : undefined
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}