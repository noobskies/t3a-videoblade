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

export interface UpdateVideoParams {
  accessToken: string;
  refreshToken: string | null;
  videoId: string; // YouTube video ID to update
  title: string;
  description?: string | null;
  tags?: string | null;
  privacy: "public" | "unlisted" | "private";
}

export interface UpdateVideoResult {
  videoId: string;
  url: string;
}

export interface VideoStats {
  videoId: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

/**
 * Get video statistics from YouTube
 */
export async function getYouTubeVideoStats(params: {
  accessToken: string;
  refreshToken: string | null;
  videoIds: string[];
}): Promise<VideoStats[]> {
  if (params.videoIds.length === 0) return [];

  const oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    "https://t3a-videoblade.vercel.app/api/auth/callback/google",
  );

  oauth2Client.setCredentials({
    access_token: params.accessToken,
    refresh_token: params.refreshToken,
  });

  const youtube = google.youtube({ version: "v3", auth: oauth2Client });

  // YouTube API limit for 'id' parameter is 50
  const chunkedIds = [];
  for (let i = 0; i < params.videoIds.length; i += 50) {
    chunkedIds.push(params.videoIds.slice(i, i + 50));
  }

  const allStats: VideoStats[] = [];

  for (const chunk of chunkedIds) {
    const response = await youtube.videos.list({
      part: ["statistics"],
      id: chunk,
    });

    if (response.data.items) {
      response.data.items.forEach((item) => {
        if (item.id && item.statistics) {
          allStats.push({
            videoId: item.id,
            views: parseInt(item.statistics.viewCount ?? "0"),
            likes: parseInt(item.statistics.likeCount ?? "0"),
            comments: parseInt(item.statistics.commentCount ?? "0"),
            shares: 0, // Not available via API publicly
          });
        }
      });
    }
  }

  return allStats;
}

/**
 * Delete a video from YouTube
 */
export async function deleteVideoFromYouTube(params: {
  accessToken: string;
  refreshToken: string | null;
  videoId: string;
}): Promise<void> {
  const oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    "https://t3a-videoblade.vercel.app/api/auth/callback/google",
  );

  oauth2Client.setCredentials({
    access_token: params.accessToken,
    refresh_token: params.refreshToken,
  });

  const youtube = google.youtube({ version: "v3", auth: oauth2Client });

  await youtube.videos.delete({
    id: params.videoId,
  });
}

/**
 * Update an existing YouTube video's metadata
 * Does NOT re-upload the video file
 */
export async function updateVideoOnYouTube(
  params: UpdateVideoParams,
): Promise<UpdateVideoResult> {
  const oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    "https://t3a-videoblade.vercel.app/api/auth/callback/google",
  );

  oauth2Client.setCredentials({
    access_token: params.accessToken,
    refresh_token: params.refreshToken,
  });

  const youtube = google.youtube({ version: "v3", auth: oauth2Client });

  // Prepare tags
  const tags = params.tags ? params.tags.split(",").map((t) => t.trim()) : [];

  // Update video metadata on YouTube
  const response = await youtube.videos.update({
    part: ["snippet", "status"],
    requestBody: {
      id: params.videoId, // IMPORTANT: This tells YouTube which video to update
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
