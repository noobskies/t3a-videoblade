import { env } from "@/env";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "./s3";
import type { VideoStats } from "./types/analytics";
import type { VimeoUploadResponse, VimeoVideoStats } from "./types/platform";

const VIMEO_API_BASE = "https://api.vimeo.com";

/**
 * Get video statistics from Vimeo
 */
export async function getVimeoVideoStats(params: {
  accessToken: string;
  videoIds: string[]; // These are just the numeric IDs (e.g., "123456")
}): Promise<VideoStats[]> {
  if (params.videoIds.length === 0) return [];

  // Vimeo accepts comma-separated URIs for filtering
  // Format: /videos/123456,/videos/789012
  const uris = params.videoIds.map((id) => `/videos/${id}`).join(",");

  const response = await fetch(
    `${VIMEO_API_BASE}/me/videos?uris=${encodeURIComponent(uris)}&fields=uri,name,stats`,
    {
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.vimeo.*+json;version=3.4",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Vimeo API error: ${response.statusText}`);
  }

  const data = (await response.json()) as {
    data: VimeoVideoStats[];
    total: number;
  };

  return data.data.map((video) => {
    // Extract ID from URI (/videos/123456 -> 123456)
    const videoId = video.uri.split("/").pop() ?? "";
    return {
      videoId,
      views: video.stats.plays ?? 0,
      likes: video.stats.likes ?? 0,
      comments: video.stats.comments ?? 0,
      shares: 0, // Vimeo doesn't expose share count in basic stats
    };
  });
}

/**
 * Upload video to Vimeo using "Pull" approach (server-to-server)
 */
export async function uploadVideoToVimeo(params: {
  accessToken: string;
  s3Key: string;
  title: string;
  description?: string | null;
  privacy: "public" | "unlisted" | "private" | "disable"; // Vimeo privacy options
  scheduledPublishAt?: Date | null;
}) {
  // 1. Generate Signed S3 URL
  const command = new GetObjectCommand({
    Bucket: env.AWS_S3_BUCKET_NAME,
    Key: params.s3Key,
  });

  // URL valid for 1 hour (Vimeo needs time to start download)
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  // Prepare request body
  const body: Record<string, unknown> = {
    upload: {
      approach: "pull",
      link: signedUrl,
    },
    name: params.title,
    description: params.description ?? "",
    privacy: {
      view: params.privacy === "private" ? "nobody" : params.privacy,
    },
  };

  // Handle Scheduling
  if (params.scheduledPublishAt) {
    // Vimeo accepts ISO 8601
    body.publish = {
      time: params.scheduledPublishAt.toISOString(),
    };
  }

  // 2. Initiate Pull Upload
  const response = await fetch(`${VIMEO_API_BASE}/me/videos`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.vimeo.*+json;version=3.4",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Vimeo upload failed: ${errorText}`);
  }

  const data = (await response.json()) as VimeoUploadResponse;

  // Extract ID from URI (/videos/123456 -> 123456)
  const videoId = data.uri.split("/").pop() ?? "";

  return {
    videoId,
    url: data.link,
  };
}

/**
 * Update video metadata on Vimeo
 */
export async function updateVideoOnVimeo(params: {
  accessToken: string;
  videoId: string;
  title?: string;
  description?: string | null;
  privacy?: "public" | "unlisted" | "private" | "disable";
  scheduledPublishAt?: Date | null;
}) {
  const body: Record<string, unknown> = {};
  if (params.title) body.name = params.title;
  if (params.description !== undefined)
    body.description = params.description ?? "";
  if (params.privacy) {
    body.privacy = {
      view: params.privacy === "private" ? "nobody" : params.privacy,
    };
  }
  if (params.scheduledPublishAt) {
    body.publish = {
      time: params.scheduledPublishAt.toISOString(),
    };
  }

  const response = await fetch(`${VIMEO_API_BASE}/videos/${params.videoId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.vimeo.*+json;version=3.4",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Vimeo update failed: ${response.statusText}`);
  }

  return true;
}

/**
 * Delete video from Vimeo
 */
export async function deleteVideoFromVimeo(params: {
  accessToken: string;
  videoId: string;
}) {
  const response = await fetch(`${VIMEO_API_BASE}/videos/${params.videoId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      Accept: "application/vnd.vimeo.*+json;version=3.4",
    },
  });

  if (!response.ok) {
    // 404 implies already deleted
    if (response.status === 404) return true;
    throw new Error(`Vimeo delete failed: ${response.statusText}`);
  }

  return true;
}
