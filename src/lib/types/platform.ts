/**
 * Platform domain types
 * All types related to platform connections and OAuth
 */

import type { RouterOutputs } from "@/trpc/react";

/**
 * Platform connection as returned from the platform.list query
 * Matches the shape from src/server/api/routers/platform.ts
 */
export interface PlatformConnection {
  id: string;
  platform: string;
  platformUsername: string;
  isActive: boolean;
  createdAt: Date;
}

/**
 * Array of platform connections
 */
export type PlatformConnectionList = PlatformConnection[];

/**
 * Type guard to validate data matches our interface
 */
export function isPlatformConnectionList(
  data: unknown,
): data is PlatformConnectionList {
  return Array.isArray(data);
}

/**
 * Type from router output for validation
 */
export type PlatformListFromRouter = RouterOutputs["platform"]["list"];

/**
 * TikTok API Response Types
 */
export interface TikTokInitResponse {
  data: {
    upload_url: string;
    publish_id: string;
  };
  error: {
    code: string;
    message: string;
    log_id: string;
  };
}

export interface TikTokStatusResponse {
  data: {
    status: string;
    fail_reason?: string;
    publicaly_available_post_id?: string[];
  };
  error: {
    code: string;
    message: string;
    log_id: string;
  };
}
