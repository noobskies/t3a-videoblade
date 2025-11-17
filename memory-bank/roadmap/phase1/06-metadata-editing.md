# Phase 1: Video Metadata Editing

## Goal

Allow users to edit video title, description, tags, and privacy settings before publishing.

**Estimated Time**: 2-3 hours

---

## Prerequisites

- [x] 02-s3-upload.md - Video router exists
- [x] 03-video-library.md - Video library displays videos

---

## Tasks

### 1. Add Update Procedure to Video Router

Update `src/server/api/routers/video.ts`:

```typescript
/**
 * Update video metadata
 */
update: protectedProcedure
  .input(
    z.object({
      id: z.string().cuid(),
      title: z.string().min(1).max(100).optional(),
      description: z.string().max(5000).optional(),
      tags: z.string().max(500).optional(),
      privacy: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]).optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { id, ...updateData } = input;

    // Verify ownership
    const video = await ctx.db.video.findUnique({
      where: { id },
      select: { createdById: true },
    });

    if (!video || video.createdById !== ctx.session.user.id) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    // Update video
    const updated = await ctx.db.video.update({
      where: { id },
      data: updateData,
    });

    return updated;
  }),

/**
 * Get single video details
 */
get: protectedProcedure
  .input(z.object({ id: z.string().cuid() }))
  .query(async ({ ctx, input }) => {
    const video = await ctx.db.video.findUnique({
      where: { id: input.id },
      include: {
        publishJobs: {
          include: {
            platformConnection: true,
          },
        },
      },
    });

    if (!video || video.createdById !== ctx.session.user.id) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return {
      ...video,
      fileSize: video.fileSize.toString(),
    };
  }),
```

### 2. Create Edit Page

Create `src/app/video/[id]/edit/page.tsx`:

```typescript
"use client";

import { api } from "@/trpc/react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function EditVideoPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;

  const { data: video, isLoading } = api.video.get.useQuery({ id: videoId });
  const updateVideo = api.video.update.useMutation();

  const [title, setTitle] = useState(video?.title || "");
  const [description, setDescription] = useState(video?.description || "");
  const [tags, setTags] = useState(video?.tags || "");
  const [privacy, setPrivacy] = useState(video?.privacy || "UNLISTED");

  // Update state when video loads
  if (video && !title) {
    setTitle(video.title);
    setDescription(video.description || "");
    setTags(video.tags || "");
    setPrivacy(video.privacy);
  }

  const handleSave = async () => {
    try {
      await updateVideo.mutateAsync({
        id: videoId,
        title,
        description,
        tags,
        privacy: privacy as "PUBLIC" | "UNLISTED" | "PRIVATE",
      });
      alert("Video updated!");
      router.push("/library");
    } catch (error) {
      alert("Failed to update video");
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-white">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-4xl font-bold">Edit Video</h1>

        <div className="max-w-2xl rounded-lg border border-gray-700 bg-gray-800 p-6">
          {/* Title */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded border border-gray-600 bg-gray-700 p-2"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full rounded border border-gray-600 bg-gray-700 p-2"
            />
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tech, tutorial, coding"
              className="w-full rounded border border-gray-600 bg-gray-700 p-2"
            />
          </div>

          {/* Privacy */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium">Privacy</label>
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              className="w-full rounded border border-gray-600 bg-gray-700 p-2"
            >
              <option value="PUBLIC">Public</option>
              <option value="UNLISTED">Unlisted</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={updateVideo.isPending}
              className="flex-1 rounded bg-blue-600 px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
            >
              {updateVideo.isPending ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => router.push("/library")}
              className="rounded border border-gray-600 px-4 py-2 hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
```

---

## Testing

1. **Go to library**, click edit on a video
2. **Modify** title, description, tags, privacy
3. **Save** changes
4. **Verify** updates in library

---

## Checklist

- [ ] Update procedure added to video router
- [ ] Get procedure added to video router
- [ ] Edit page created
- [ ] Form updates video successfully
- [ ] Cancel button works

**Estimated Completion**: ✅ 2-3 hours

---

## Next Step

👉 **[07-inngest-setup.md](./07-inngest-setup.md)** - Set up Inngest for background publishing jobs
