/**
 * Video domain types
 * All types related to videos, files, and video metadata
 */

import type { RouterOutputs } from "@/trpc/react";

/**
 * Publish job for a video on a specific platform
 */
export interface PublishJob {
  platform: string;
  status: string;
}

/**
 * Video item as returned from the video.list query
 * Matches the shape from src/server/api/routers/video.ts
 */
export interface VideoListItem {
  id: string;
  title: string;
  description: string | null;
  fileName: string;
  fileSize: string; // BigInt converted to string for JSON
  thumbnailUrl: string | null;
  privacy: string;
  createdAt: Date;
  publishJobs: PublishJob[];
}

/**
 * Array of video list items
 */
export type VideoList = VideoListItem[];

/**
 * Type guard to validate RouterOutputs match our explicit interface
 * This ensures type safety between frontend and backend
 */
export type VideoListFromRouter = RouterOutputs["video"]["list"];
