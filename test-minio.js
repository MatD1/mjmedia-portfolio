/**
 * MinIO Connection Test Script
 * Run this to test your MinIO connection after updating the URLs
 */

import { env } from './src/env.js';

console.log('Testing MinIO Configuration...\n');

console.log('Environment Variables:');
console.log('- MINIMO_URL:', env.MINIMO_URL);
console.log('- MINIMO_API_URL:', env.MINIMO_API_URL);
console.log('- MINIMO_PORT:', env.MINIMO_PORT);
console.log('- MINIMO_ACCESS_KEY:', env.MINIMO_ACCESS_KEY ? '✓ Set' : '✗ Missing');
console.log('- MINIMO_ACCESS_SECRET:', env.MINIMO_ACCESS_SECRET ? '✓ Set' : '✗ Missing');
console.log('- MINIMO_STORAGE_BUCKET:', env.MINIMO_STORAGE_BUCKET);
console.log('');

// Test basic configuration
if (!env.MINIMO_URL) {
  console.error('❌ MINIMO_URL is not set');
  process.exit(1);
}

if (!env.MINIMO_ACCESS_KEY || !env.MINIMO_ACCESS_SECRET) {
  console.error('❌ MinIO credentials are not set');
  process.exit(1);
}

if (!env.MINIMO_STORAGE_BUCKET) {
  console.error('❌ MINIMO_STORAGE_BUCKET is not set');
  process.exit(1);
}

// Test URL accessibility
console.log('Testing URL accessibility...');

const testUrls = [
  env.MINIMO_URL,
  env.MINIMO_API_URL,
].filter(Boolean).filter(url => typeof url === 'string');

for (const url of testUrls) {
  console.log(`Testing: ${url}`);
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    console.log(`✓ ${url} is accessible (Status: ${response.status})`);
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.log(`✗ ${url} failed: ${error.message}`);
    
    if (error.message.includes('getaddrinfo ENOTFOUND') || error.message.includes('connect ECONNREFUSED')) {
      console.log('  → This suggests the URL is incorrect or the service is not running');
    } else if (error.message.includes('certificate') || error.message.includes('TLS')) {
      console.log('  → This suggests SSL/TLS issues');
    } else if (error.message.includes('timeout')) {
      console.log('  → This suggests the service is slow to respond or blocking connections');
    }
  }
}

console.log('\nNext Steps:');
console.log('1. Go to your Railway dashboard');
console.log('2. Find your MinIO service');
console.log('3. Go to Settings → Networking');
console.log('4. Copy the public domain URL');
console.log('5. Update MINIMO_URL and MINIMO_API_URL in your .env.local file');
console.log('\nExample Railway URLs:');
console.log('- MINIMO_URL: https://minio-production-abc123.up.railway.app');
console.log('- MINIMO_API_URL: https://minio-production-abc123.up.railway.app:9090');