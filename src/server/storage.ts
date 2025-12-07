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
 */
function getApiEndpoint(): string | null {
	// If API URL is explicitly provided, use it
	if (env.MINIMO_API_URL) {
		return env.MINIMO_API_URL;
	}
	
	// If only console URL is provided, try to derive API endpoint
	if (env.MINIMO_URL) {
		try {
			const url = new URL(env.MINIMO_URL);
			// For Railway deployments, API is often on the same domain but port 9000
			// Or it might be a different subdomain
			// Try common patterns:
			
			// Pattern 1: Replace 'console' with 'api' in subdomain
			if (url.hostname.includes('console')) {
				const apiHostname = url.hostname.replace('console', 'api');
				return `${url.protocol}//${apiHostname}`;
			}
			
			// Pattern 2: Use same host but with port 9000
			return `${url.protocol}//${url.hostname}:9000`;
		} catch {
			// If URL parsing fails, return the original
			return env.MINIMO_URL;
		}
	}
	
	return null;
}

/**
 * Get the public URL for file access (uses console URL or API URL)
 */
function getPublicUrl(): string | null {
	if (env.MINIMO_URL) {
		return env.MINIMO_URL;
	}
	return getApiEndpoint();
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

async function getS3Client() {
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
			throw new Error("Minio API endpoint is not configured. Please set MINIMO_API_URL or MINIMO_URL.");
		}
		
		const { endpoint } = parseEndpoint(apiEndpoint);
		s3ClientInstance = new S3Client({
			endpoint, // Minio API endpoint (e.g., https://api.example.com:9000)
			region: "us-east-1", // Minio doesn't care about region, but SDK requires it
			credentials: {
				accessKeyId: env.MINIMO_ACCESS_KEY!,
				secretAccessKey: env.MINIMO_ACCESS_SECRET!,
			},
			forcePathStyle: true, // Required for Minio - uses path-style URLs
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

	// Return the public URL (use console URL if available, otherwise API URL)
	const publicUrl = getPublicUrl();
	if (!publicUrl) {
		throw new Error("Minio URL is not configured for public file access.");
	}
	const { endpoint } = parseEndpoint(publicUrl);
	return `${endpoint}/${bucketName}/${filename}`;
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

		return (response.Contents ?? []).map((item) => ({
			filename: item.Key ?? "",
			url: `${endpoint}/${bucketName}/${item.Key}`,
			size: item.Size,
		}));
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		// Provide more helpful error messages
		if (errorMessage.includes('NoSuchBucket') || errorMessage.includes('does not exist')) {
			throw new Error(`Bucket "${bucketName}" does not exist. Please create it first or check your MINIMO_STORAGE_BUCKET setting.`);
		}
		if (errorMessage.includes('InvalidAccessKeyId') || errorMessage.includes('SignatureDoesNotMatch')) {
			throw new Error(`Invalid Minio credentials. Please check your MINIMO_ACCESS_KEY and MINIMO_ACCESS_SECRET.`);
		}
		if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ENOTFOUND')) {
			const apiEndpoint = getApiEndpoint();
			throw new Error(`Cannot connect to Minio API endpoint. Please check your MINIMO_API_URL or MINIMO_URL setting. Current API endpoint: ${apiEndpoint ?? 'not configured'}`);
		}
		throw new Error(`Failed to list files from Minio: ${errorMessage}`);
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

