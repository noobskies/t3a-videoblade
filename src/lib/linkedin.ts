import { z } from "zod";

const LinkedInProfileSchema = z.object({
  sub: z.string(),
  name: z.string(),
  picture: z.string().optional(),
  email: z.string().optional(),
});

export type LinkedInProfile = z.infer<typeof LinkedInProfileSchema>;

export async function getLinkedInProfile(
  accessToken: string,
): Promise<LinkedInProfile> {
  const response = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch LinkedIn profile: ${response.statusText}`);
  }

  const data = (await response.json()) as unknown;
  return LinkedInProfileSchema.parse(data);
}

interface LinkedInPostContent {
  text: string;
  media?: {
    type: "IMAGE" | "VIDEO";
    buffer: Buffer;
    mimeType: string;
    title?: string;
  };
}

// --- Media Upload Helpers ---

interface InitializeUploadResponse {
  value: {
    uploadUrlExpiresAt: number;
    uploadUrl: string;
    image?: string; // For Images API
    video?: string; // For Videos API
    uploadToken?: string; // Sometimes needed for finalization
  };
}

async function initializeUpload(
  accessToken: string,
  ownerUrn: string,
  type: "IMAGE" | "VIDEO",
): Promise<InitializeUploadResponse["value"]> {
  const resource = type === "IMAGE" ? "images" : "videos";
  const endpoint = `https://api.linkedin.com/rest/${resource}?action=initializeUpload`;

  const body = {
    initializeUploadRequest: {
      owner: ownerUrn,
    },
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "LinkedIn-Version": "202401", // Use a recent version
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to initialize ${type} upload: ${error}`);
  }

  const data = (await response.json()) as InitializeUploadResponse;
  return data.value;
}

async function uploadFile(url: string, file: Buffer, mimeType: string) {
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": mimeType,
    },
    body: file as unknown as BodyInit,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload file to LinkedIn: ${error}`);
  }

  // Return ETag if needed for finalization
  return response.headers.get("etag");
}

async function finalizeUpload(
  accessToken: string,
  videoUrn: string,
  uploadToken: string,
  etag: string,
) {
  const endpoint = `https://api.linkedin.com/rest/videos?action=finalizeUpload`;

  const body = {
    finalizeUploadRequest: {
      video: videoUrn,
      uploadToken: uploadToken,
      uploadedPartIds: [etag],
    },
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "LinkedIn-Version": "202401",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to finalize video upload: ${error}`);
  }
}

// --- Main Publish Function ---

export async function publishToLinkedIn(
  accessToken: string,
  userId: string, // LinkedIn Person URN (e.g., "urn:li:person:12345")
  content: LinkedInPostContent,
) {
  // Construct the author URN
  const authorUrn = userId.startsWith("urn:li:")
    ? userId
    : `urn:li:person:${userId}`;

  let mediaUrn: string | undefined;
  let shareMediaCategory: "NONE" | "IMAGE" | "VIDEO" = "NONE";

  // 1. Handle Media Upload
  if (content.media) {
    console.log(`Initializing ${content.media.type} upload to LinkedIn...`);

    const initData = await initializeUpload(
      accessToken,
      authorUrn,
      content.media.type,
    );

    console.log("Upload initialized:", initData);

    const uploadUrl = initData.uploadUrl;
    mediaUrn = content.media.type === "IMAGE" ? initData.image : initData.video;

    if (!uploadUrl || !mediaUrn) {
      throw new Error("Failed to get upload URL or URN from LinkedIn");
    }

    console.log(`Uploading ${content.media.buffer.length} bytes...`);
    const etag = await uploadFile(
      uploadUrl,
      content.media.buffer,
      content.media.mimeType,
    );
    console.log("File uploaded successfully");

    // Finalize Video if needed
    if (content.media.type === "VIDEO") {
      console.log("Finalizing video upload...");
      // Note: For single-file PUT uploads, some docs say finalize is not needed or different.
      // However, the Videos API usually requires it.
      // If initData has `uploadToken`, we should use it.
      // If not, maybe it's auto-finalized?
      // Let's assume if we have an uploadToken, we assume we need to finalize.
      if (initData.uploadToken && etag) {
        await finalizeUpload(accessToken, mediaUrn, initData.uploadToken, etag);
        console.log("Video finalized");
      }
    }

    shareMediaCategory = content.media.type;
  }

  // 2. Create UGC Post
  interface LinkedInRequestBody {
    author: string;
    lifecycleState: "PUBLISHED";
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: {
          text: string;
        };
        shareMediaCategory: "NONE" | "IMAGE" | "VIDEO";
        media?: Array<{
          status: "READY";
          description?: { text: string };
          media: string; // URN
          title?: { text: string };
        }>;
      };
    };
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" | "CONNECTIONS";
    };
  }

  const body: LinkedInRequestBody = {
    author: authorUrn,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: {
          text: content.text,
        },
        shareMediaCategory: shareMediaCategory,
      },
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
    },
  };

  // Add media reference if present
  if (mediaUrn && shareMediaCategory !== "NONE") {
    body.specificContent["com.linkedin.ugc.ShareContent"].media = [
      {
        status: "READY",
        description: { text: content.media?.title ?? "Media content" },
        media: mediaUrn,
        title: { text: content.media?.title ?? "Media content" },
      },
    ];
  }

  const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to publish to LinkedIn: ${error}`);
  }

  const data = (await response.json()) as { id: string };
  return {
    id: data.id, // e.g., "urn:li:share:12345"
    url: `https://www.linkedin.com/feed/update/${data.id}`, // Construct link
  };
}
