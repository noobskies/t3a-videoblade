import { env } from "@/env";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import type {
  TikTokInitResponse,
  TikTokStatusResponse,
} from "./types/platform";
import { s3Client } from "./s3";
import type { VideoStats } from "./types/analytics";

const TIKTOK_API_BASE = "https://open.tiktokapis.com/v2";

/**
 * Get video statistics from TikTok
 */
export async function getTikTokVideoStats(params: {
  accessToken: string;
  videoIds: string[];
}): Promise<VideoStats[]> {
  if (params.videoIds.length === 0) return [];

  // TikTok V2 Video Query endpoint
  const response = await fetch(`${TIKTOK_API_BASE}/video/query/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filters: {
        video_ids: params.videoIds,
      },
      fields: [
        "id",
        "view_count",
        "like_count",
        "comment_count",
        "share_count",
      ],
    }),
  });

  if (!response.ok) {
    // If token invalid, we might want to throw specific error to trigger refresh
    throw new Error(`TikTok API error: ${response.statusText}`);
  }

  const data = (await response.json()) as {
    data?: {
      videos?: Array<{
        id: string;
        view_count?: number;
        like_count?: number;
        comment_count?: number;
        share_count?: number;
      }>;
    };
    error?: { code: string; message: string };
  };

  if (data.error && data.error.code !== "ok") {
    throw new Error(`TikTok stats error: ${data.error.message}`);
  }

  return (
    data.data?.videos?.map((video) => ({
      videoId: video.id,
      views: video.view_count ?? 0,
      likes: video.like_count ?? 0,
      comments: video.comment_count ?? 0,
      shares: video.share_count ?? 0,
    })) ?? []
  );
}

export async function publishToTikTok(params: {
  accessToken: string;
  s3Key: string;
  title: string;
  description?: string | null;
  privacy: "PUBLIC_TO_EVERYONE" | "MUTUAL_FOLLOW_FRIENDS" | "SELF_ONLY";
}) {
  // 1. Initialize Upload
  // POST /v2/post/publish/inbox/video/init/

  // Download video from S3 first to get size
  const s3Response = await s3Client.send(
    new GetObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: params.s3Key,
    }),
  );

  if (!s3Response.Body || !s3Response.ContentLength) {
    throw new Error("Failed to download video from S3");
  }

  const videoSize = s3Response.ContentLength;

  // Convert stream to buffer for upload
  // Note: For very large files, we might need to implement chunked upload/streaming
  // But for MVP and Lambda limits, this should work for reasonably sized videos
  const chunks: Uint8Array[] = [];
  // @ts-expect-error - Body is iterable
  for await (const chunk of s3Response.Body) {
    chunks.push(chunk as Uint8Array);
  }
  const videoBuffer = Buffer.concat(chunks);

  const initResponse = await fetch(
    `${TIKTOK_API_BASE}/post/publish/inbox/video/init/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source_info: {
          source: "FILE_UPLOAD",
          video_size: videoSize,
          chunk_size: videoSize, // Upload in one chunk for simplicity
          total_chunk_count: 1,
        },
      }),
    },
  );

  if (!initResponse.ok) {
    const error = await initResponse.text();
    throw new Error(`TikTok init failed: ${error}`);
  }

  const initData = (await initResponse.json()) as TikTokInitResponse;

  // Check for API specific errors in successful HTTP response
  if (initData.error && initData.error.code !== "ok") {
    throw new Error(`TikTok init API error: ${JSON.stringify(initData.error)}`);
  }

  const { upload_url, publish_id } = initData.data;

  // 2. Upload Video
  // PUT {upload_url}

  const uploadResponse = await fetch(upload_url, {
    method: "PUT",
    headers: {
      "Content-Type": "video/mp4",
      "Content-Range": `bytes 0-${videoSize - 1}/${videoSize}`,
    },
    body: videoBuffer,
  });

  if (!uploadResponse.ok) {
    const error = await uploadResponse.text();
    throw new Error(`TikTok upload failed: ${error}`);
  }

  // 3. Check Status (Optional here, handled by polling later)
  // But we return publish_id so we can poll it

  return {
    publishId: publish_id,
  };
}

export async function checkTikTokStatus(
  accessToken: string,
  publishId: string,
) {
  const response = await fetch(
    `${TIKTOK_API_BASE}/post/publish/status/fetch/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        publish_id: publishId,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to check status");
  }

  const data = (await response.json()) as TikTokStatusResponse;

  if (data.error && data.error.code !== "ok") {
    throw new Error(`TikTok status API error: ${JSON.stringify(data.error)}`);
  }

  return data;
}
