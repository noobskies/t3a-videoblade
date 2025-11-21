import { db } from "@/server/db";
import {
  Platform,
  type PlatformConnection,
} from "../../../../generated/prisma";
import { type CommentService, type CommentData } from "./comment-service";
import { YouTubeCommentService } from "./youtube-comment-service";
import { LinkedInCommentService } from "./linkedin-comment-service";

export class SyncService {
  private getService(platform: Platform): CommentService | null {
    switch (platform) {
      case Platform.YOUTUBE:
        return new YouTubeCommentService();
      case Platform.LINKEDIN:
        return new LinkedInCommentService();
      default:
        return null;
    }
  }

  async syncCommentsForConnection(connectionId: string) {
    const connection = await db.platformConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection?.isActive) {
      throw new Error("Connection not found or inactive");
    }

    const service = this.getService(connection.platform);
    if (!service) {
      console.warn(`No comment service for platform ${connection.platform}`);
      return;
    }

    try {
      // 1. Fetch comments from platform
      // Determine "since" date - e.g. last comment we have, or 7 days ago
      const lastComment = await db.comment.findFirst({
        where: { platformConnectionId: connectionId },
        orderBy: { publishedAt: "desc" },
      });

      // Fallback to 30 days ago if no comments, or if we want to be safe
      // Ideally we overlap a bit to catch late-arriving comments
      const since = lastComment
        ? new Date(lastComment.publishedAt.getTime() - 24 * 60 * 60 * 1000) // 1 day buffer
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

      const comments = await service.fetchComments(
        connection.accessToken,
        connection.platformUserId,
        since,
      );

      console.log(
        `Fetched ${comments.length} comments for ${connection.platform}`,
      );

      // 2. Upsert into DB
      for (const commentData of comments) {
        await this.upsertComment(connection, commentData);
      }
    } catch (error) {
      console.error(
        `Failed to sync comments for connection ${connectionId}:`,
        error,
      );
      // Don't throw, just log, so other syncs can proceed if called in loop
    }
  }

  private async upsertComment(
    connection: PlatformConnection,
    data: CommentData,
  ) {
    // 1. Upsert Author
    const author = await db.commentAuthor.upsert({
      where: {
        platform_externalId: {
          platform: data.platform,
          externalId: data.author.externalId,
        },
      },
      create: {
        platform: data.platform,
        externalId: data.author.externalId,
        name: data.author.name,
        avatarUrl: data.author.avatarUrl,
        profileUrl: data.author.profileUrl,
      },
      update: {
        name: data.author.name,
        avatarUrl: data.author.avatarUrl,
        profileUrl: data.author.profileUrl,
      },
    });

    // 2. Try to find linked local Post
    let postId: string | undefined;
    if (data.externalPostId) {
      // Find a PublishJob that resulted in this external ID
      const job = await db.publishJob.findFirst({
        where: {
          platform: data.platform,
          platformVideoId: data.externalPostId,
        },
        select: { postId: true },
      });
      if (job) {
        postId = job.postId;
      }
    }

    // 3. Upsert Comment
    // We use upsert to handle updates (e.g. edited comments)
    // Note: Parent might not exist yet if we fetch out of order.
    // If parentId is present, we should check if it exists.
    // If not, we might need to create a placeholder or just link it later.
    // For now, we only link if parent exists.

    let parentDbId: string | undefined;
    if (data.parentId) {
      const parent = await db.comment.findUnique({
        where: {
          platform_externalId: {
            platform: data.platform,
            externalId: data.parentId,
          },
        },
      });
      if (parent) {
        parentDbId = parent.id;
      } else {
        // Option: Create placeholder or skip threading for now.
        // Let's just skip threading linkage if parent is missing,
        // it might be fixed in next sync if parent arrives later.
      }
    }

    await db.comment.upsert({
      where: {
        platform_externalId: {
          platform: data.platform,
          externalId: data.externalId,
        },
      },
      create: {
        platform: data.platform,
        externalId: data.externalId,
        content: data.content,
        publishedAt: data.publishedAt,
        platformConnectionId: connection.id,
        authorId: author.id,
        postId: postId,
        externalPostId: data.externalPostId,
        parentId: parentDbId,
        // Default status is OPEN (isResolved=false)
      },
      update: {
        content: data.content,
        // Don't update status/hidden fields as those are local state
      },
    });
  }
}
