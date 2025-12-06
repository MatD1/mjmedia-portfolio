import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from "~/env";

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

// Create S3-compatible client for Minio
const createS3Client = () => {
	if (!isMinioConfigured) {
		return null;
	}

	const { endpoint } = parseEndpoint(env.MINIO_ENDPOINT!);

	return new S3Client({
		endpoint,
		region: "us-east-1", // Minio doesn't care about region, but SDK requires it
		credentials: {
			accessKeyId: env.MINIO_ACCESS_KEY!,
			secretAccessKey: env.MINIO_SECRET_KEY!,
		},
		forcePathStyle: true, // Required for Minio
	});
};

export const s3Client = createS3Client();
export const bucketName = env.MINIO_BUCKET ?? "uploads";

/**
 * Upload a file to Minio/S3
 */
export async function uploadFile(
	buffer: Buffer,
	filename: string,
	contentType: string
): Promise<string> {
	if (!s3Client) {
		throw new Error("Minio storage is not configured");
	}

	const command = new PutObjectCommand({
		Bucket: bucketName,
		Key: filename,
		Body: buffer,
		ContentType: contentType,
		ACL: "public-read",
	});

	await s3Client.send(command);

	// Return the public URL
	const { endpoint } = parseEndpoint(env.MINIO_ENDPOINT!);
	return `${endpoint}/${bucketName}/${filename}`;
}

/**
 * List all files in the bucket
 */
export async function listFiles(): Promise<Array<{ filename: string; url: string; size?: number }>> {
	if (!s3Client) {
		throw new Error("Minio storage is not configured");
	}

	const command = new ListObjectsV2Command({
		Bucket: bucketName,
	});

	const response = await s3Client.send(command);
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
	if (!s3Client) {
		throw new Error("Minio storage is not configured");
	}

	const command = new DeleteObjectCommand({
		Bucket: bucketName,
		Key: filename,
	});

	await s3Client.send(command);
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

