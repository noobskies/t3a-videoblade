# Phase 2: Multi-Platform Publishing UI

## Goal

Build UI for publishing videos to multiple platforms simultaneously with platform-specific metadata.

**Estimated Time**: 3-4 hours

---

## Prerequisites

- [x] Phase 1 - Single platform publishing works
- [x] 02-tiktok-publisher.md - TikTok integration ready
- [x] Both YouTube and TikTok connected

---

## What We're Building

A publish page where users can:

- Select which platforms to publish to (YouTube, TikTok, or both)
- Configure platform-specific metadata
- See per-platform publish status
- Handle partial failures

---

## Tasks

### 1. Create Publish Page

Create `src/app/publish/[videoId]/page.tsx`:

```typescript
"use client";

import { api } from "@/trpc/react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Youtube, Video, CheckCircle } from "lucide-react"; // Add TikTok icon

export default function PublishPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.videoId as string;

  const { data: video } = api.video.get.useQuery({ id: videoId });
  const { data: connections } = api.platform.list.useQuery();
  const publishVideo = api.video.publishMulti.useMutation();

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<Record<string, any>>({});

  const youtubeConnected = connections?.some((c) => c.platform === "YOUTUBE");
  const tiktokConnected = connections?.some((c) => c.platform === "TIKTOK");

  const togglePlatform = (platform: string) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
      // Initialize metadata
      setMetadata({
        ...metadata,
        [platform]: {
          title: video?.title,
          description: video?.description,
          privacy: video?.privacy,
        },
      });
    }
  };

  const handlePublish = async () => {
    if (selectedPlatforms.length === 0) {
      alert("Select at least one platform");
      return;
    }

    try {
      await publishVideo.mutateAsync({
        videoId,
        platforms: selectedPlatforms,
        metadata,
      });

      alert("Publishing started! Check video library for status.");
      router.push("/library");
    } catch (error) {
      alert("Failed to start publishing");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-4xl font-bold">Publish Video</h1>

        {video && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold">{video.title}</h2>
            <p className="text-gray-400">{video.description}</p>
          </div>
        )}

        {/* Platform Selection */}
        <div className="mb-8">
          <h3 className="mb-4 text-xl font-semibold">Select Platforms</h3>

          <div className="space-y-4">
            {/* YouTube */}
            <div
              onClick={() => youtubeConnected && togglePlatform("YOUTUBE")}
              className={`cursor-pointer rounded-lg border p-4 ${
                selectedPlatforms.includes("YOUTUBE")
                  ? "border-blue-500 bg-blue-900/20"
                  : "border-gray-700 bg-gray-800"
              } ${!youtubeConnected && "cursor-not-allowed opacity-50"}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Youtube className="h-8 w-8 text-red-500" />
                  <div>
                    <h4 className="font-semibold">YouTube</h4>
                    <p className="text-sm text-gray-400">
                      {youtubeConnected ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
                {selectedPlatforms.includes("YOUTUBE") && (
                  <CheckCircle className="h-6 w-6 text-green-400" />
                )}
              </div>
            </div>

            {/* TikTok */}
            <div
              onClick={() => tiktokConnected && togglePlatform("TIKTOK")}
              className={`cursor-pointer rounded-lg border p-4 ${
                selectedPlatforms.includes("TIKTOK")
                  ? "border-pink-500 bg-pink-900/20"
                  : "border-gray-700 bg-gray-800"
              } ${!tiktokConnected && "cursor-not-allowed opacity-50"}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Use TikTok Icon */}
                  <Video className="h-8 w-8 text-pink-500" />
                  <div>
                    <h4 className="font-semibold">TikTok</h4>
                    <p className="text-sm text-gray-400">
                      {tiktokConnected ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
                {selectedPlatforms.includes("TIKTOK") && (
                  <CheckCircle className="h-6 w-6 text-green-400" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Platform-Specific Metadata */}
        {selectedPlatforms.map((platform) => (
          <div key={platform} className="mb-6 rounded-lg bg-gray-800 p-6">
            <h3 className="mb-4 text-lg font-semibold">{platform} Settings</h3>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm">Title</label>
                <input
                  type="text"
                  value={metadata[platform]?.title || ""}
                  onChange={(e) =>
                    setMetadata({
                      ...metadata,
                      [platform]: {
                        ...metadata[platform],
                        title: e.target.value,
                      },
                    })
                  }
                  className="w-full rounded border border-gray-600 bg-gray-700 p-2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm">Description</label>
                <textarea
                  value={metadata[platform]?.description || ""}
                  onChange={(e) =>
                    setMetadata({
                      ...metadata,
                      [platform]: {
                        ...metadata[platform],
                        description: e.target.value,
                      },
                    })
                  }
                  rows={4}
                  className="w-full rounded border border-gray-600 bg-gray-700 p-2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm">Privacy</label>
                <select
                  value={metadata[platform]?.privacy || "UNLISTED"}
                  onChange={(e) =>
                    setMetadata({
                      ...metadata,
                      [platform]: {
                        ...metadata[platform],
                        privacy: e.target.value,
                      },
                    })
                  }
                  className="w-full rounded border border-gray-600 bg-gray-700 p-2"
                >
                  {/* TikTok specific options */}
                  {platform === "TIKTOK" ? (
                    <>
                      <option value="PUBLIC">Public</option>
                      <option value="PRIVATE">Self Only</option>
                      <option value="MUTUAL_FOLLOW_FRIENDS">Friends</option>
                    </>
                  ) : (
                    <>
                      <option value="PUBLIC">Public</option>
                      <option value="UNLISTED">Unlisted</option>
                      <option value="PRIVATE">Private</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>
        ))}

        {/* Publish Button */}
        <button
          onClick={handlePublish}
          disabled={selectedPlatforms.length === 0 || publishVideo.isPending}
          className="w-full rounded bg-blue-600 px-6 py-3 text-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {publishVideo.isPending
            ? "Publishing..."
            : `Publish to ${selectedPlatforms.length} Platform${selectedPlatforms.length !== 1 ? "s" : ""}`}
        </button>
      </div>
    </main>
  );
}
```

### 2. Add Multi-Platform Publish Procedure

Update `src/server/api/routers/video.ts`:

```typescript
/**
 * Publish to multiple platforms
 */
publishMulti: protectedProcedure
  .input(
    z.object({
      videoId: z.string().cuid(),
      platforms: z.array(z.enum(["YOUTUBE", "TIKTOK"])),
      metadata: z.record(
        z.object({
          title: z.string().optional(),
          description: z.string().optional(),
          privacy: z.enum(["PUBLIC", "UNLISTED", "PRIVATE", "MUTUAL_FOLLOW_FRIENDS"]).optional(),
        })
      ),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const jobIds: string[] = [];

    // Create job for each platform
    for (const platform of input.platforms) {
      // Get platform connection
      const connection = await ctx.db.platformConnection.findUnique({
        where: {
          userId_platform: {
            userId: ctx.session.user.id,
            platform,
          },
        },
      });

      if (!connection) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `${platform} not connected`,
        });
      }

      // Create job
      const job = await ctx.db.publishJob.create({
        data: {
          platform,
          status: "PENDING",
          videoId: input.videoId,
          platformConnectionId: connection.id,
          createdById: ctx.session.user.id,
          ...input.metadata[platform],
        },
      });

      jobIds.push(job.id);

      // Trigger Inngest
      const eventName =
        platform === "TIKTOK"
          ? "video/publish.tiktok"
          : "video/publish.youtube";

      await inngest.send({
        name: eventName,
        data: { jobId: job.id },
      });
    }

    return { jobIds };
  }),
```

---

## Features

✅ Platform selection with checkboxes
✅ Show which platforms are connected
✅ Platform-specific metadata configuration
✅ Publish to multiple platforms simultaneously
✅ Each platform gets its own job
✅ Independent status tracking per platform

---

## Testing

1. **Connect both** YouTube and TikTok
2. **Go to publish page** for a video
3. **Select both platforms**
4. **Configure different metadata** for each
5. **Click Publish**
6. **Check library** - should see 2 jobs (one per platform)
7. **Verify both platforms** receive the video

---

## Checklist

- [ ] Publish page created
- [ ] Platform selection UI working
- [ ] Platform-specific metadata forms
- [ ] publishMulti procedure added
- [ ] Multiple jobs created correctly
- [ ] Both platforms receive video
- [ ] Partial failures handled (one succeeds, one fails)

**Estimated Completion**: ✅ 3-4 hours

---

## Next Step

👉 **[04-delete-videos.md](./04-delete-videos.md)** - Add delete functionality for videos
