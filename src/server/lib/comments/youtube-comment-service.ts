import { google } from "googleapis";
import { type CommentService, type CommentData } from "./comment-service";
import { Platform } from "../../../../generated/prisma";

export class YouTubeCommentService implements CommentService {
  private getClient(accessToken: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    return google.youtube({ version: "v3", auth });
  }

  async fetchComments(
    accessToken: string,
    platformUserId: string,
    since?: Date,
  ): Promise<CommentData[]> {
    const youtube = this.getClient(accessToken);

    // Fetch top-level comment threads related to the channel
    const response = await youtube.commentThreads.list({
      part: ["snippet", "replies"],
      allThreadsRelatedToChannelId: platformUserId,
      maxResults: 20, // Start small to avoid quota issues
      order: "time",
    });

    const items = response.data.items ?? [];
    const result: CommentData[] = [];

    for (const item of items) {
      const topLevel = item.snippet?.topLevelComment?.snippet;
      const topLevelId = item.snippet?.topLevelComment?.id;

      if (topLevel && topLevelId) {
        const publishedAt = new Date(topLevel.publishedAt ?? "");

        // Filter by date if needed
        if (since && publishedAt < since) continue;

        result.push({
          platform: Platform.YOUTUBE,
          externalId: topLevelId,
          content: topLevel.textDisplay ?? "",
          publishedAt,
          author: {
            platform: Platform.YOUTUBE,
            externalId: topLevel.authorChannelId?.value ?? "unknown",
            name: topLevel.authorDisplayName ?? "Unknown",
            avatarUrl: topLevel.authorProfileImageUrl ?? undefined,
            profileUrl: topLevel.authorChannelUrl ?? undefined,
          },
          externalPostId: topLevel.videoId ?? undefined,
        });

        // Handle replies
        if (item.replies?.comments) {
          for (const reply of item.replies.comments) {
            const replySnippet = reply.snippet;
            const replyId = reply.id;

            if (replySnippet && replyId) {
              const replyPublishedAt = new Date(replySnippet.publishedAt ?? "");

              result.push({
                platform: Platform.YOUTUBE,
                externalId: replyId,
                content: replySnippet.textDisplay ?? "",
                publishedAt: replyPublishedAt,
                author: {
                  platform: Platform.YOUTUBE,
                  externalId: replySnippet.authorChannelId?.value ?? "unknown",
                  name: replySnippet.authorDisplayName ?? "Unknown",
                  avatarUrl: replySnippet.authorProfileImageUrl ?? undefined,
                  profileUrl: replySnippet.authorChannelUrl ?? undefined,
                },
                parentId: topLevelId,
                externalPostId: replySnippet.videoId ?? undefined,
              });
            }
          }
        }
      }
    }

    return result;
  }

  async reply(
    accessToken: string,
    platformUserId: string, // Not used for reply, but kept for interface
    commentExternalId: string,
    content: string,
  ): Promise<string> {
    const youtube = this.getClient(accessToken);

    const response = await youtube.comments.insert({
      part: ["snippet"],
      requestBody: {
        snippet: {
          parentId: commentExternalId,
          textOriginal: content,
        },
      },
    });

    if (!response.data.id) {
      throw new Error("Failed to post reply: No ID returned");
    }

    return response.data.id;
  }

  async delete(accessToken: string, commentExternalId: string): Promise<void> {
    const youtube = this.getClient(accessToken);
    await youtube.comments.delete({
      id: commentExternalId,
    });
  }
}
