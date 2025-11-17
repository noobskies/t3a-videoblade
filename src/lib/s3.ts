import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/env";

// Initialize S3 client
export const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Generate unique S3 key for video file
 */
export function generateVideoS3Key(userId: string, filename: string): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);
  const extension = filename.split(".").pop() ?? "mp4";
  return `videos/${userId}/${timestamp}-${randomId}.${extension}`;
}

/**
 * Generate presigned URL for uploading to S3
 */
export async function getUploadPresignedUrl(
  key: string,
  contentType: string,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  // URL expires in 10 minutes
  const presignedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 600,
  });

  return presignedUrl;
}

/**
 * Delete file from S3
 */
export async function deleteFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: env.AWS_S3_BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Get public URL for S3 object (for thumbnails, not videos)
 */
export function getS3Url(key: string): string {
  return `https://${env.AWS_S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
}
