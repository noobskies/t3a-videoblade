# Phase 1: Video Library UI

## Goal

Build a video library page that displays all uploaded videos with metadata and publish status.

**Estimated Time**: 3-4 hours

---

## Prerequisites

- [x] 01-database-schema.md - Video model exists
- [x] 02-s3-upload.md - Videos can be uploaded
- [x] Video router with `list` procedure

---

## What We're Building

A responsive video library that shows:

- Video thumbnails (or placeholder)
- Title and description
- File info (size, upload date)
- Publish status per platform
- Actions (edit, delete, publish)

---

## Tasks

### 1. Create Video Card Component

Create `src/app/_components/video-card.tsx`:

```typescript
"use client";

import { api } from "@/trpc/react";
import { useState } from "react";
import { Video as VideoIcon, Trash2, Edit, Upload } from "lucide-react";

type VideoCardProps = {
  video: {
    id: string;
    title: string;
    description: string | null;
    fileName: string;
    fileSize: string;
    thumbnailUrl: string | null;
    privacy: string;
    createdAt: Date;
    publishJobs: Array<{
      platform: string;
      status: string;
    }>;
  };
  onDelete: () => void;
};

export function VideoCard({ video, onDelete }: VideoCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteVideo = api.video.delete.useMutation();

  const formatFileSize = (bytes: string) => {
    const size = parseInt(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024)
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${video.title}"?`)) return;

    setIsDeleting(true);
    try {
      await deleteVideo.mutateAsync({ id: video.id });
      onDelete();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete video");
    } finally {
      setIsDeleting(false);
    }
  };

  const getPlatformStatus = (platform: string) => {
    return video.publishJobs.find((job) => job.platform === platform);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-900/50 text-green-200";
      case "PROCESSING":
        return "bg-blue-900/50 text-blue-200";
      case "FAILED":
        return "bg-red-900/50 text-red-200";
      case "PENDING":
        return "bg-yellow-900/50 text-yellow-200";
      default:
        return "bg-gray-900/50 text-gray-200";
    }
  };

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 transition hover:border-gray-600">
      {/* Thumbnail */}
      <div className="mb-3 aspect-video w-full overflow-hidden rounded bg-gray-900">
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <VideoIcon className="h-12 w-12 text-gray-600" />
          </div>
        )}
      </div>

      {/* Title & Description */}
      <h3 className="mb-1 truncate text-lg font-semibold">{video.title}</h3>
      {video.description && (
        <p className="mb-2 line-clamp-2 text-sm text-gray-400">
          {video.description}
        </p>
      )}

      {/* Metadata */}
      <div className="mb-3 flex gap-2 text-xs text-gray-500">
        <span>{formatFileSize(video.fileSize)}</span>
        <span>•</span>
        <span>{formatDate(video.createdAt)}</span>
        <span>•</span>
        <span className="capitalize">{video.privacy.toLowerCase()}</span>
      </div>

      {/* Publish Status */}
      {video.publishJobs.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {video.publishJobs.map((job) => (
            <span
              key={job.platform}
              className={`rounded px-2 py-1 text-xs ${getStatusColor(job.status)}`}
            >
              {job.platform}: {job.status}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          className="flex-1 rounded bg-blue-600 px-3 py-2 text-sm hover:bg-blue-700"
          onClick={() => (window.location.href = `/publish/${video.id}`)}
        >
          <Upload className="inline h-4 w-4" /> Publish
        </button>
        <button
          className="rounded bg-gray-700 px-3 py-2 text-sm hover:bg-gray-600"
          onClick={() => (window.location.href = `/video/${video.id}/edit`)}
        >
          <Edit className="inline h-4 w-4" />
        </button>
        <button
          className="rounded bg-red-900/50 px-3 py-2 text-sm hover:bg-red-900"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 className="inline h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
```

### 2. Create Video Library Page

Create `src/app/library/page.tsx`:

```typescript
"use client";

import { api } from "@/trpc/react";
import { VideoCard } from "@/app/_components/video-card";
import { Upload, Video as VideoIcon } from "lucide-react";
import Link from "next/link";

export default function LibraryPage() {
  const { data: videos, isLoading, refetch } = api.video.list.useQuery();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-blue-500" />
          <p className="text-gray-400">Loading videos...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Video Library</h1>
            <p className="mt-2 text-gray-400">
              {videos?.length || 0} video{videos?.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/upload"
            className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-700"
          >
            <Upload className="h-5 w-5" />
            Upload Video
          </Link>
        </div>

        {/* Video Grid */}
        {videos && videos.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onDelete={() => refetch()}
              />
            ))}
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <VideoIcon className="mb-4 h-20 w-20 text-gray-700" />
            <h2 className="mb-2 text-2xl font-semibold text-gray-400">
              No videos yet
            </h2>
            <p className="mb-6 text-gray-500">
              Upload your first video to get started
            </p>
            <Link
              href="/upload"
              className="flex items-center gap-2 rounded bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700"
            >
              <Upload className="h-5 w-5" />
              Upload Video
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
```

### 3. Add Navigation Links

Update `src/app/layout.tsx` to include navigation:

```typescript
// Add to existing layout
<nav className="border-b border-gray-800 bg-gray-900">
  <div className="container mx-auto flex items-center justify-between px-4 py-4">
    <Link href="/" className="text-xl font-bold">
      VideoBlade
    </Link>
    <div className="flex gap-4">
      <Link
        href="/library"
        className="text-gray-300 hover:text-white"
      >
        Library
      </Link>
      <Link
        href="/upload"
        className="text-gray-300 hover:text-white"
      >
        Upload
      </Link>
    </div>
  </div>
</nav>
```

### 4. Install Lucide Icons

```bash
npm install lucide-react
```

---

## Features Implemented

✅ **Responsive Grid Layout**: 1-4 columns based on screen size
✅ **Video Cards**: Thumbnail, metadata, publish status
✅ **Empty State**: Friendly message when no videos
✅ **Delete Functionality**: With confirmation dialog
✅ **Loading State**: Spinner while fetching
✅ **File Size Formatting**: Human-readable sizes
✅ **Date Formatting**: Localized dates
✅ **Publish Status Badges**: Color-coded by status
✅ **Quick Actions**: Publish, edit, delete buttons

---

## Testing

### Manual Test

1. **Navigate to** `/library`
2. **Verify** empty state if no videos
3. **Upload a video** via `/upload`
4. **Return to library** - video should appear
5. **Click delete** - confirm dialog should appear
6. **Delete video** - should remove from list
7. **Test responsive** - resize browser window

### Test Multiple Videos

Upload 3-4 videos to see grid layout.

---

## Styling Notes

**Current Theme**: Dark mode with gray/blue
**Responsive**: Grid adjusts 1-2-3-4 columns
**Icons**: Lucide React icons
**Hover Effects**: Cards lighten on hover

**To customize colors**:

- Update Tailwind classes in components
- Modify `getStatusColor()` function for status badges

---

## Common Issues

**Images Not Loading**:

- Check `thumbnailUrl` is valid
- Verify S3 bucket permissions
- Use placeholder icon if null

**Grid Not Responsive**:

- Ensure Tailwind CSS is configured
- Check `grid-cols-*` classes

**Delete Not Working**:

- Verify user owns the video
- Check S3 delete permissions
- See browser console for errors

**Videos Not Appearing**:

- Check user is authenticated
- Verify `video.list` procedure works
- Check database has video records

---

## Checklist Summary

- [ ] Video card component created
- [ ] Library page created
- [ ] Navigation links added
- [ ] Lucide icons installed
- [ ] Empty state displays correctly
- [ ] Video cards show metadata
- [ ] Delete functionality works
- [ ] Grid is responsive
- [ ] Loading state appears

**Estimated Completion**: ✅ 3-4 hours

---

## Next Step

Library is complete! Now add YouTube OAuth:

👉 **[04-youtube-oauth.md](./04-youtube-oauth.md)** - Connect YouTube accounts via OAuth for publishing
