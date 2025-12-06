import { env } from "~/env";

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

// Check if Minio is configured
export const isMinioConfigured = Boolean(
	env.MINIO_ENDPOINT &&
	env.MINIO_ACCESS_KEY &&
	env.MINIO_SECRET_KEY &&
	env.MINIO_BUCKET
);

// Parse the endpoint to get the URL parts
function parseEndpoint(endpoint: string) {
	try {
		const url = new URL(endpoint);
		return {
			endpoint: `${url.protocol}//${url.host}`,
			forcePathStyle: true,
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
		
		const { endpoint } = parseEndpoint(env.MINIO_ENDPOINT!);
		s3ClientInstance = new S3Client({
			endpoint,
			region: "us-east-1", // Minio doesn't care about region, but SDK requires it
			credentials: {
				accessKeyId: env.MINIO_ACCESS_KEY!,
				secretAccessKey: env.MINIO_SECRET_KEY!,
			},
			forcePathStyle: true, // Required for Minio
		});
	}
	
	return s3ClientInstance;
}

export const bucketName = env.MINIO_BUCKET ?? "uploads";

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

	// Return the public URL
	const { endpoint } = parseEndpoint(env.MINIO_ENDPOINT!);
	return `${endpoint}/${bucketName}/${filename}`;
}

/**
 * List all files in the bucket
 */
export async function listFiles(): Promise<Array<{ filename: string; url: string; size?: number }>> {
	const client = await getS3Client();
	if (!client || !ListObjectsV2Command) {
		throw new Error("Minio storage is not configured or failed to load");
	}

	const command = new ListObjectsV2Command({
		Bucket: bucketName,
	});

	const response = await client.send(command);
	const { endpoint } = parseEndpoint(env.MINIO_ENDPOINT!);

	return (response.Contents ?? []).map((item) => ({
		filename: item.Key ?? "",
		url: `${endpoint}/${bucketName}/${item.Key}`,
		size: item.Size,
	}));
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

