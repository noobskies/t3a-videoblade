import { type Platform } from "../../../../generated/prisma";

export interface CommentAuthorData {
  platform: Platform;
  externalId: string;
  name: string;
  avatarUrl?: string;
  profileUrl?: string;
}

export interface CommentData {
  platform: Platform;
  externalId: string;
  content: string;
  publishedAt: Date;
  author: CommentAuthorData;

  // Threading
  parentId?: string; // External ID of parent comment
  externalPostId?: string; // ID of the post on the platform
}

export interface CommentService {
  /**
   * Fetch recent comments for a specific connection.
   * Implementation should handle pagination and limits appropriately.
   */
  fetchComments(
    accessToken: string,
    platformUserId: string,
    since?: Date,
  ): Promise<CommentData[]>;

  /**
   * Reply to a comment.
   */
  reply(
    accessToken: string,
    platformUserId: string,
    commentExternalId: string,
    content: string,
  ): Promise<string>; // Returns the new comment's external ID

  /**
   * Delete a comment (if supported).
   */
  delete(accessToken: string, commentExternalId: string): Promise<void>;
}
