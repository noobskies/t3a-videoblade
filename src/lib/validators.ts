import { z } from "zod";

// Post validation schemas
export const createPostSchema = z
  .object({
    type: z.enum(["VIDEO", "IMAGE", "TEXT"]).default("VIDEO"),
    isIdea: z.boolean().default(false),
    title: z.string().min(1).max(100).optional(),
    description: z.string().max(5000).optional(),
    tags: z.string().max(500).optional(),
    privacy: z
      .enum(["PUBLIC", "UNLISTED", "PRIVATE", "MUTUAL_FOLLOW_FRIENDS"])
      .default("UNLISTED"),

    // Text content
    content: z.string().optional(),

    // Media fields (Video/Image)
    s3Key: z.string().optional(),
    s3Bucket: z.string().optional(),
    fileName: z.string().optional(),
    fileSize: z.bigint().positive().optional(),
    mimeType: z.string().optional(),
    duration: z.number().int().positive().optional(),
    thumbnailS3Key: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "TEXT") {
        // If it's an idea, we need at least title or content
        // If it's a post, we usually expect content, but maybe title is enough?
        // For now, enforce content for TEXT posts unless it's an idea with a title
        if (data.isIdea) {
          return !!(data.title || data.content);
        }
        return !!data.content;
      }
      // For VIDEO/IMAGE, S3 fields are required
      return !!(
        data.s3Key &&
        data.s3Bucket &&
        data.fileName &&
        data.fileSize &&
        data.mimeType
      );
    },
    {
      message: "Missing required fields for the selected post type",
    },
  );

export const updatePostSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1).max(100).optional(),
  isIdea: z.boolean().optional(),
  description: z.string().max(5000).optional(),
  content: z.string().optional(),
  tags: z.string().max(500).optional(),
  privacy: z
    .enum(["PUBLIC", "UNLISTED", "PRIVATE", "MUTUAL_FOLLOW_FRIENDS"])
    .optional(),
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
  postId: z.string().cuid(),
  platformConnectionId: z.string().cuid(),
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(5000).optional(),
  tags: z.string().max(500).optional(),
  privacy: z
    .enum(["PUBLIC", "UNLISTED", "PRIVATE", "MUTUAL_FOLLOW_FRIENDS"])
    .optional(),
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
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreatePlatformConnectionInput = z.infer<
  typeof createPlatformConnectionSchema
>;
export type CreatePublishJobInput = z.infer<typeof createPublishJobSchema>;
export type UpdatePublishJobStatusInput = z.infer<
  typeof updatePublishJobStatusSchema
>;
