import { google } from "googleapis";
import { env } from "@/env";
import { s3Client } from "@/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export interface UploadVideoParams {
  accessToken: string;
  refreshToken: string | null;
  s3Key: string;
  title: string;
  description?: string | null;
  tags?: string | null;
  privacy: "public" | "unlisted" | "private";
}

export interface UploadVideoResult {
  videoId: string;
  url: string;
}

export async function uploadVideoToYouTube(
  params: UploadVideoParams,
): Promise<UploadVideoResult> {
  // Initialize OAuth2 client
  // Note: The redirect URI isn't used for token refresh, so we can use a placeholder
  const oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    "https://t3a-videoblade.vercel.app/api/auth/callback/google", // Only used during OAuth flow, not for API calls
  );

  oauth2Client.setCredentials({
    access_token: params.accessToken,
    refresh_token: params.refreshToken,
  });

  const youtube = google.youtube({ version: "v3", auth: oauth2Client });

  // Download video from S3
  const s3Response = await s3Client.send(
    new GetObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: params.s3Key,
    }),
  );

  if (!s3Response.Body) {
    throw new Error("Failed to download video from S3");
  }

  // Prepare tags
  const tags = params.tags ? params.tags.split(",").map((t) => t.trim()) : [];

  // Upload to YouTube
  const response = await youtube.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title: params.title,
        description: params.description ?? "",
        tags,
        categoryId: "22", // People & Blogs (default)
      },
      status: {
        privacyStatus: params.privacy,
      },
    },
    media: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      body: s3Response.Body as any, // S3 stream - googleapis accepts any readable stream
    },
  });

  const videoId = response.data.id;
  if (!videoId) {
    throw new Error("YouTube did not return video ID");
  }

  return {
    videoId,
    url: `https://www.youtube.com/watch?v=${videoId}`,
  };
}
