import { env } from "~/env";

/**
 * Minio Storage Implementation using AWS S3 SDK
 * 
 * Minio is S3-compatible, so we use the official AWS S3 SDK (@aws-sdk/client-s3)
 * which provides full compatibility with Minio's S3 API.
 * 
 * Key configuration:
 * - forcePathStyle: true (required for Minio)
 * - Custom endpoint: points to Minio API endpoint (typically port 9000)
 * - Region: "us-east-1" (Minio doesn't care, but SDK requires it)
 */

// Lazy-load AWS SDK to avoid crashes if it has issues
let S3Client: typeof import("@aws-sdk/client-s3").S3Client | null = null;
let PutObjectCommand: typeof import("@aws-sdk/client-s3").PutObjectCommand | null = null;
let ListObjectsV2Command: typeof import("@aws-sdk/client-s3").ListObjectsV2Command | null = null;
let DeleteObjectCommand: typeof import("@aws-sdk/client-s3").DeleteObjectCommand | null = null;

async function loadS3SDK() {
	if (S3Client === null) {
		try {
			const sdk = await import("@aws-sdk/client-s3");
			S3Client = sdk.S3Client;
			PutObjectCommand = sdk.PutObjectCommand;
			ListObjectsV2Command = sdk.ListObjectsV2Command;
			DeleteObjectCommand = sdk.DeleteObjectCommand;
		} catch (error) {
			console.error("Failed to load @aws-sdk/client-s3:", error);
			return false;
		}
	}
	return true;
}

/**
 * Get the Minio API endpoint URL
 * Uses MINIMO_API_URL if provided, otherwise tries to derive from MINIMO_URL
 * 
 * Note: Minio has two endpoints:
 * - Console: Port 9001 (web UI) - returns HTML/JSON
 * - API: Port 9000 (S3 API) - returns XML
 * 
 * For Railway deployments:
 * - Railway often exposes services via public URLs without ports (routing handled internally)
 * - If MINIMO_PORT is set (e.g., 9090 for Railway proxy), use that
 * - Otherwise, try to use the same URL without adding a port (Railway handles routing)
 */
function getApiEndpoint(): string | null {
	// If API URL is explicitly provided, use it (may include port or not)
	if (env.MINIMO_API_URL) {
		return env.MINIMO_API_URL;
	}
	
	// If only console URL is provided, try to derive API endpoint
	if (env.MINIMO_URL) {
		try {
			const url = new URL(env.MINIMO_URL);
			
			// Check for common Railway patterns and invalid URLs
			if (url.hostname.includes('railway.internal')) {
				console.warn('[MinIO] Warning: Using internal Railway URL. This will not work from external connections.');
				console.warn('[MinIO] Please use the public Railway URL from your service settings.');
				return null;
			}
			
			// For Railway deployments:
			// - If MINIMO_PORT is set, use it (e.g., 9090 for proxy)
			// - If URL has a port, keep it or replace based on context
			// - If no port, Railway handles routing - use same URL
			
			// Pattern 1: If MINIMO_PORT is explicitly set, use it
			if (env.MINIMO_PORT) {
				return `${url.protocol}//${url.hostname}:${env.MINIMO_PORT}`;
			}
			
			// Pattern 2: Replace 'console' with 'api' in subdomain (keep existing port if any)
			if (url.hostname.includes('console')) {
				const apiHostname = url.hostname.replace('console', 'api');
				// Keep port if it exists, otherwise don't add one (Railway routing)
				return url.port 
					? `${url.protocol}//${apiHostname}:${url.port}`
					: `${url.protocol}//${apiHostname}`;
			}
			
			// Pattern 3: For Railway, if URL has no port, use same URL with port 9000
			// If it has a port, try replacing with 9000 (standard Minio API port)
			if (url.port) {
				// If port is 9001 (console), replace with 9000 (API)
				if (url.port === '9001') {
					return `${url.protocol}//${url.hostname}:9000`;
				}
				// Otherwise keep the existing port
				return env.MINIMO_URL;
			}
			
			// Pattern 4: For Railway deployments, try different port strategies
			if (url.hostname.includes('railway.app')) {
				// Railway often uses the same URL for both console and API
				// Try without port first (Railway internal routing)
				if (!env.MINIMO_PORT) {
					console.log('[MinIO] Railway detected: trying same URL for API (Railway internal routing)');
					return env.MINIMO_URL;
				}
				// If port is specified, use it
				return `${url.protocol}//${url.hostname}:${env.MINIMO_PORT}`;
			}
			
			// Pattern 5: No port specified - Railway handles routing, use same URL
			// This is common for Railway deployments where the public URL routes internally
			return env.MINIMO_URL;
		} catch (err) {
			console.error('[MinIO] Failed to parse MINIMO_URL:', err);
			// If URL parsing fails, return the original
			return env.MINIMO_URL;
		}
	}
	
	return null;
}

/**
 * Get the public URL for file access (should use API endpoint for direct file access)
 */
function getPublicUrl(): string | null {
	// For file access, use the API endpoint (bucket URL), not the console URL
	const apiEndpoint = getApiEndpoint();
	if (apiEndpoint) {
		return apiEndpoint;
	}
	// Fallback to console URL if no API endpoint
	if (env.MINIMO_URL) {
		return env.MINIMO_URL;
	}
	return null;
}

// Check if Minio is configured
export const isMinioConfigured = Boolean(
	(env.MINIMO_API_URL || env.MINIMO_URL) &&
	env.MINIMO_ACCESS_KEY &&
	env.MINIMO_ACCESS_SECRET &&
	env.MINIMO_STORAGE_BUCKET
);

/**
 * Parse the endpoint URL for S3 client configuration
 * Handles URLs with ports correctly (url.host includes port)
 */
function parseEndpoint(endpoint: string) {
	try {
		const url = new URL(endpoint);
		// url.host includes both hostname and port (e.g., "example.com:9000")
		return {
			endpoint: `${url.protocol}//${url.host}`,
			forcePathStyle: true, // Required for Minio (uses path-style: /bucket/key instead of bucket.s3.amazonaws.com/key)
		};
	} catch {
		// If it's not a full URL, assume it's just a host
		return {
			endpoint: endpoint.startsWith("http") ? endpoint : `https://${endpoint}`,
			forcePathStyle: true,
		};
	}
}

// Lazy S3 client creation
let s3ClientInstance: InstanceType<typeof import("@aws-sdk/client-s3").S3Client> | null = null;

export async function getS3Client() {
	if (!isMinioConfigured) {
		return null;
	}
	
	if (s3ClientInstance === null) {
		const loaded = await loadS3SDK();
		if (!loaded || !S3Client) {
			return null;
		}
		
		const apiEndpoint = getApiEndpoint();
		if (!apiEndpoint) {
			console.error('[MinIO] API endpoint could not be determined from configuration');
			console.error('[MinIO] Please check your MINIMO_URL or set MINIMO_API_URL directly');
			throw new Error("MinIO API endpoint is not configured. Please set MINIMO_API_URL or provide a valid MINIMO_URL.");
		}
		
		const { endpoint } = parseEndpoint(apiEndpoint);
		
		// Log the endpoint being used (helpful for debugging)
		console.log(`[MinIO] Connecting to API endpoint: ${endpoint}`);
		console.log(`[MinIO] Bucket: ${bucketName}`);
		if (env.MINIMO_PORT) {
			console.log(`[MinIO] Using port override: ${env.MINIMO_PORT}`);
		}
		if (endpoint.includes('railway.internal')) {
			console.error(`[MinIO] ERROR: Using internal Railway URL: ${endpoint}`);
			console.error(`[MinIO] This will not work! Please use the public Railway URL.`);
			throw new Error("Cannot use internal Railway URL. Please update MINIMO_URL to use the public Railway URL.");
		}
		if (endpoint.includes('railway.app')) {
			console.log(`[MinIO] Railway deployment detected`);
		}
		
		s3ClientInstance = new S3Client({
			endpoint, // Minio API endpoint (e.g., https://api.example.com:9000)
			region: "us-east-1", // Minio doesn't care about region, but SDK requires it
			credentials: {
				accessKeyId: env.MINIMO_ACCESS_KEY!,
				secretAccessKey: env.MINIMO_ACCESS_SECRET!,
			},
			forcePathStyle: true, // Required for Minio - uses path-style URLs
			// Note: AWS SDK v3 handles timeouts internally, but Railway networking
			// might require using internal service names instead of public URLs
		});
	}
	
	return s3ClientInstance;
}

export const bucketName = env.MINIMO_STORAGE_BUCKET ?? "uploads";

/**
 * Upload a file to Minio/S3
 */
export async function uploadFile(
	buffer: Buffer,
	filename: string,
	contentType: string
): Promise<string> {
	const client = await getS3Client();
	if (!client || !PutObjectCommand) {
		throw new Error("Minio storage is not configured or failed to load");
	}

	const command = new PutObjectCommand({
		Bucket: bucketName,
		Key: filename,
		Body: buffer,
		ContentType: contentType,
		ACL: "public-read",
	});

	await client.send(command);

	// Return the alternative proxy URL that handles special characters better
	return `/api/media-alt/${encodeURIComponent(filename)}`;
}

/**
 * List all files in the bucket
 */
export async function listFiles(): Promise<Array<{ filename: string; url: string; size?: number }>> {
	if (!isMinioConfigured) {
		throw new Error("Minio storage is not configured. Please set MINIMO_API_URL (or MINIMO_URL), MINIMO_ACCESS_KEY, MINIMO_ACCESS_SECRET, and MINIMO_STORAGE_BUCKET environment variables.");
	}

	const client = await getS3Client();
	if (!client || !ListObjectsV2Command) {
		throw new Error("Failed to initialize Minio client. Please check your configuration and ensure @aws-sdk/client-s3 is installed.");
	}

	try {
		const command = new ListObjectsV2Command({
			Bucket: bucketName,
		});

		const response = await client.send(command);
		const publicUrl = getPublicUrl();
		if (!publicUrl) {
			throw new Error("Minio URL is not configured for public file access.");
		}
		const { endpoint } = parseEndpoint(publicUrl);

		return (response.Contents ?? []).map((item) => {
			const filename = item.Key ?? "";
			// Use the alternative proxy endpoint that handles special characters better
			const encodedFilename = encodeURIComponent(filename);
			const url = `/api/media-alt/${encodedFilename}`;
			console.log(`[MinIO] Generated proxied URL for "${filename}": ${url}`); // Debug logging
			return {
				filename,
				url,
				size: item.Size,
			};
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		
		// Try to extract more details from the error
		let detailedError = errorMessage;
		if (error && typeof error === 'object' && '$response' in error) {
			const response = (error as { $response?: { body?: string; statusCode?: number } }).$response;
			if (response?.body) {
				try {
					// If the response is JSON (error page), try to parse it
					const jsonBody = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
					if (jsonBody.error || jsonBody.message) {
						detailedError = `${errorMessage} - Server response: ${jsonBody.error || jsonBody.message}`;
					}
				} catch {
					// If it's not JSON, include the raw body if it's a string
					if (typeof response.body === 'string' && response.body.length < 500) {
						detailedError = `${errorMessage} - Server response: ${response.body}`;
					}
				}
			}
			if (response?.statusCode) {
				detailedError += ` (HTTP ${response.statusCode})`;
			}
		}
		
		// Check for deserialization errors (JSON response instead of XML)
		if (errorMessage.includes('Deserialization error') || errorMessage.includes('char') || errorMessage.includes('is not expected')) {
			const apiEndpoint = getApiEndpoint();
			throw new Error(
				`Minio endpoint returned an unexpected response format. This usually means:\n` +
				`1. The endpoint URL is pointing to the console (port 9001) instead of the API (port 9000)\n` +
				`2. For Railway: The endpoint might need a proxy port (set MINIMO_PORT=9090 if Railway uses port 9090)\n` +
				`3. The endpoint requires a different path (e.g., /minio or /api)\n` +
				`4. The endpoint is behind a proxy returning an error page\n\n` +
				`Current API endpoint: ${apiEndpoint ?? 'not configured'}\n` +
				`Current port override: ${env.MINIMO_PORT ?? 'none'}\n` +
				`For Railway: Try setting MINIMO_PORT=9090 or use the Railway public URL without a port (Railway handles routing internally).`
			);
		}
		
		// Provide more helpful error messages
		if (errorMessage.includes('NoSuchBucket') || errorMessage.includes('does not exist')) {
			throw new Error(`Bucket "${bucketName}" does not exist. Please create it first or check your MINIMO_STORAGE_BUCKET setting.`);
		}
		if (errorMessage.includes('InvalidAccessKeyId') || errorMessage.includes('SignatureDoesNotMatch')) {
			throw new Error(`Invalid Minio credentials. Please check your MINIMO_ACCESS_KEY and MINIMO_ACCESS_SECRET.`);
		}
		if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ENOTFOUND') || errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
			const apiEndpoint = getApiEndpoint();
			throw new Error(
				`Connection timeout or refused when connecting to Minio API endpoint.\n` +
				`This often happens with Railway when:\n` +
				`1. Using public URL instead of internal service name\n` +
				`2. Port configuration is incorrect\n` +
				`3. Service is not accessible from your app's network\n\n` +
				`Current API endpoint: ${apiEndpoint ?? 'not configured'}\n` +
				`For Railway: Try using the internal service name (e.g., minio.railway.internal:9000) ` +
				`or check Railway's networking settings to ensure services can communicate.`
			);
		}
		throw new Error(`Failed to list files from Minio: ${detailedError}`);
	}
}

/**
 * Delete a file from Minio/S3
 */
export async function deleteFile(filename: string): Promise<void> {
	const client = await getS3Client();
	if (!client || !DeleteObjectCommand) {
		throw new Error("Minio storage is not configured or failed to load");
	}

	const command = new DeleteObjectCommand({
		Bucket: bucketName,
		Key: filename,
	});

	await client.send(command);
}

/**
 * Get the content type from a file extension
 */
export function getContentType(ext: string): string {
	const types: Record<string, string> = {
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		png: "image/png",
		gif: "image/gif",
		webp: "image/webp",
		avif: "image/avif",
		svg: "image/svg+xml",
		mp4: "video/mp4",
		webm: "video/webm",
		ogg: "video/ogg",
		pdf: "application/pdf",
		doc: "application/msword",
		docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	};
	return types[ext.toLowerCase()] ?? "application/octet-stream";
}

