import { z } from "zod";

// Video validation schemas
export const createVideoSchema = z.object({
  s3Key: z.string().min(1),
  s3Bucket: z.string().min(1),
  fileName: z.string().min(1),
  fileSize: z.bigint().positive(),
  mimeType: z.string().regex(/^video\//),
  title: z.string().min(1).max(100),
  description: z.string().max(5000).optional(),
  tags: z.string().max(500).optional(),
  privacy: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]),
  duration: z.number().int().positive().optional(),
});

export const updateVideoMetadataSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(5000).optional(),
  tags: z.string().max(500).optional(),
  privacy: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]).optional(),
  thumbnailUrl: z.string().url().optional(),
});

// Platform Connection validation schemas
export const createPlatformConnectionSchema = z.object({
  platform: z.enum(["YOUTUBE", "RUMBLE"]),
  platformUserId: z.string().min(1),
  platformUsername: z.string().optional(),
  accessToken: z.string().min(1),
  refreshToken: z.string().optional(),
  tokenExpiry: z.date().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Publish Job validation schemas
export const createPublishJobSchema = z.object({
  videoId: z.string().cuid(),
  platformConnectionId: z.string().cuid(),
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(5000).optional(),
  tags: z.string().max(500).optional(),
  privacy: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]).optional(),
  scheduledFor: z.date().optional(),
});

export const updatePublishJobStatusSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"]),
  platformVideoId: z.string().optional(),
  platformVideoUrl: z.string().url().optional(),
  errorMessage: z.string().optional(),
});

// Type exports for use in tRPC procedures
export type CreateVideoInput = z.infer<typeof createVideoSchema>;
export type UpdateVideoMetadataInput = z.infer<
  typeof updateVideoMetadataSchema
>;
export type CreatePlatformConnectionInput = z.infer<
  typeof createPlatformConnectionSchema
>;
export type CreatePublishJobInput = z.infer<typeof createPublishJobSchema>;
export type UpdatePublishJobStatusInput = z.infer<
  typeof updatePublishJobStatusSchema
>;
