import { type CommentService, type CommentData } from "./comment-service";
import { Platform } from "../../../../generated/prisma";

interface LinkedInActivityResponse {
  elements: Array<{
    id: string; // urn:li:ugcPost:123 or urn:li:share:123
    created: {
      time: number;
    };
    // other fields
  }>;
}

interface LinkedInCommentResponse {
  elements: Array<{
    id: number; // Comment ID (numeric) but URN is urn:li:comment:(activityUrn,commentId)
    actor: string; // urn:li:person:123
    created: {
      time: number;
    };
    message: {
      text: string;
    };
    object: string; // The parent object URN
    $URN: string; // The full URN of the comment
  }>;
}

interface LinkedInProfileResponse {
  id: string;
  localizedFirstName: string;
  localizedLastName: string;
  profilePicture?: {
    "displayImage~": {
      elements: Array<{
        identifiers: Array<{
          identifier: string;
        }>;
      }>;
    };
  };
}

export class LinkedInCommentService implements CommentService {
  private async fetch(
    url: string,
    accessToken: string,
    options: RequestInit = {},
  ): Promise<unknown> {
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
        "LinkedIn-Version": "202401",
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`LinkedIn API error (${response.status}): ${text}`);
    }

    return response.json();
  }

  /**
   * Helper to fetch recent posts
   */
  private async fetchRecentPosts(
    accessToken: string,
    authorUrn: string,
  ): Promise<string[]> {
    // Fetch recent UGC posts
    // Note: q=authors requires encoded URN
    const encodedUrn = encodeURIComponent(authorUrn);
    const url = `https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(${encodedUrn})&count=10&sortBy=CREATED`;

    try {
      const data = (await this.fetch(
        url,
        accessToken,
      )) as LinkedInActivityResponse;
      return data.elements.map((e) => e.id);
    } catch (e) {
      console.error("Failed to fetch recent LinkedIn posts:", e);
      return [];
    }
  }

  /**
   * Helper to fetch comments for a specific post URN
   */
  private async fetchCommentsForPost(
    accessToken: string,
    postUrn: string,
    profileCache: Map<string, { name: string; avatar?: string }>,
  ): Promise<CommentData[]> {
    // Construct socialActions URN
    // Endpoint: /socialActions/{postUrn}/comments
    const encodedPostUrn = encodeURIComponent(postUrn);
    const url = `https://api.linkedin.com/v2/socialActions/${encodedPostUrn}/comments?count=50`;

    try {
      const data = (await this.fetch(
        url,
        accessToken,
      )) as LinkedInCommentResponse;
      const comments: CommentData[] = [];

      for (const item of data.elements) {
        // Fetch author profile if not in cache
        if (!profileCache.has(item.actor)) {
          try {
            // Need to fetch profile.
            // Optimizing: For now, just use "Unknown" or implement a bulk fetcher.
            // Or fetch individual (slow).
            // Let's assume we fetch individual for MVP.
            // Profile endpoint: /v2/people/(id={id})?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))
            // Extract ID from urn:li:person:ID
            const personId = item.actor.split(":").pop();
            if (personId) {
              const profileUrl = `https://api.linkedin.com/v2/people/(id=${personId})?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))`;
              const profile = (await this.fetch(
                profileUrl,
                accessToken,
              )) as LinkedInProfileResponse;

              const name = `${profile.localizedFirstName} ${profile.localizedLastName}`;
              const avatar =
                profile.profilePicture?.["displayImage~"]?.elements?.[0]
                  ?.identifiers?.[0]?.identifier;

              profileCache.set(item.actor, { name, avatar });
            }
          } catch (e) {
            console.warn(`Failed to fetch profile for ${item.actor}`, e);
            profileCache.set(item.actor, { name: "LinkedIn User" });
          }
        }

        const author = profileCache.get(item.actor) ?? {
          name: "LinkedIn User",
        };

        comments.push({
          platform: Platform.LINKEDIN,
          externalId: item.$URN || `urn:li:comment:${postUrn},${item.id}`,
          content: item.message.text,
          publishedAt: new Date(item.created.time),
          author: {
            platform: Platform.LINKEDIN,
            externalId: item.actor,
            name: author.name,
            avatarUrl: author.avatar,
          },
          externalPostId: postUrn,
        });
      }

      return comments;
    } catch (e) {
      // 404 means no social actions found (maybe post deleted or not supported), ignore
      return [];
    }
  }

  async fetchComments(
    accessToken: string,
    platformUserId: string,
    since?: Date,
  ): Promise<CommentData[]> {
    // Ensure platformUserId is a URN
    const authorUrn = platformUserId.startsWith("urn:li:")
      ? platformUserId
      : `urn:li:person:${platformUserId}`;

    // 1. Get recent posts
    const postUrns = await this.fetchRecentPosts(accessToken, authorUrn);

    // 2. Get comments for each post (in parallel)
    const profileCache = new Map<string, { name: string; avatar?: string }>();
    const commentPromises = postUrns.map((urn) =>
      this.fetchCommentsForPost(accessToken, urn, profileCache),
    );
    const results = await Promise.all(commentPromises);

    // Flatten and sort
    const allComments = results
      .flat()
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

    if (since) {
      return allComments.filter((c) => c.publishedAt >= since);
    }

    return allComments;
  }

  async reply(
    accessToken: string,
    platformUserId: string,
    commentExternalId: string,
    content: string,
  ): Promise<string> {
    // commentExternalId should be a URN: urn:li:comment:(activityUrn,commentId)
    // Endpoint: /socialActions/{objectUrn}/comments
    // We need to extract the objectUrn (the parent entity)

    // Wait, replying to a comment is actually replying to the parent object with a "parentComment" field?
    // Or is it a different endpoint?
    // LinkedIn documentation says: To reply to a comment, create a comment on the same object (post) and reference the parent comment.

    // Extract Post URN from Comment URN if possible.
    // Comment URN format: urn:li:comment:(urn:li:activity:123,456)
    // Or urn:li:comment:(urn:li:share:123,456)
    // The part inside the first parenthesis before comma is likely the object URN.

    // But parsing URNs is fragile.
    // Let's assume we store externalPostId in DB.

    // Actually, the generic create comment endpoint:
    // POST /socialActions/{objectUrn}/comments
    // Body: { "parentComment": "urn:li:comment:...", "message": { "text": "..." } }

    // We need the objectUrn (post URN).
    // If we don't have it passed in, we might need to extract it.

    const regex = /urn:li:comment:\(([^,]+),/;
    const matches = regex.exec(commentExternalId);
    if (!matches?.[1]) {
      throw new Error(
        "Invalid comment URN format, cannot extract parent object URN",
      );
    }

    const objectUrn = matches[1];
    const encodedObjectUrn = encodeURIComponent(objectUrn);
    const url = `https://api.linkedin.com/v2/socialActions/${encodedObjectUrn}/comments`;

    const body = {
      parentComment: commentExternalId,
      message: {
        text: content,
      },
    };

    const data = (await this.fetch(url, accessToken, {
      method: "POST",
      body: JSON.stringify(body),
    })) as { id: string; $URN?: string };

    return data.$URN ?? `${commentExternalId}_reply_${data.id}`; // Fallback ID construction
  }

  async delete(accessToken: string, commentExternalId: string): Promise<void> {
    // To delete a comment: DELETE /socialActions/{objectUrn}/comments/{commentId}

    const regex = /urn:li:comment:\(([^,]+),(\d+)\)/;
    const matches = regex.exec(commentExternalId);
    if (!matches?.[1] || !matches[2]) {
      throw new Error("Invalid comment URN format");
    }

    const objectUrn = matches[1];
    const commentId = matches[2];
    const encodedObjectUrn = encodeURIComponent(objectUrn);

    const url = `https://api.linkedin.com/v2/socialActions/${encodedObjectUrn}/comments/${commentId}`;

    await this.fetch(url, accessToken, { method: "DELETE" });
  }
}
