/**
 * Post domain types (formerly Video)
 * All types related to posts (video, image, text) and their metadata
 */

import type { RouterOutputs } from "@/trpc/react";

export type Platform = "YOUTUBE" | "TIKTOK" | "RUMBLE" | "VIMEO";
export type PublishStatus =
  | "PENDING"
  | "SCHEDULED"
  | "PLATFORM_SCHEDULED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

/**
 * Publish job for a post on a specific platform
 */
export interface PublishJob {
  id: string;
  platform: Platform;
  status: PublishStatus;
  errorMessage: string | null;
}

/**
 * Post item as returned from the post.list query
 * Matches the shape from src/server/api/routers/post.ts
 */
export interface PostListItem {
  id: string;
  type: "VIDEO" | "IMAGE" | "TEXT";
  title: string;
  description: string | null;
  fileName: string | null;
  fileSize: string | null; // BigInt converted to string for JSON
  thumbnailUrl: string | null;
  privacy: string;
  createdAt: Date;
  publishJobs: PublishJob[];
}

/**
 * Array of post list items
 */
export type PostList = PostListItem[];

/**
 * Type guard to validate RouterOutputs match our explicit interface
 * This ensures type safety between frontend and backend
 */
export type PostListFromRouter = RouterOutputs["post"]["list"];
