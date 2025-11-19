"use client";

/**
 * Video Library Page
 * Displays all user's uploaded videos with metadata and publish status
 *
 * Note: Loading and error states are handled automatically by Next.js
 * via loading.tsx and error.tsx in this directory
 */

import { api } from "@/trpc/react";
import type { VideoList } from "@/lib/types";
import { VideoCard } from "@/app/_components/video-card";
import { CloudUpload as Upload, Movie as VideoIcon } from "@mui/icons-material";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Type guard to ensure we have valid video data
 * This satisfies both TypeScript and ESLint's strict type checking
 */
function isValidVideoList(data: unknown): data is VideoList {
  return Array.isArray(data);
}

export default function LibraryPage() {
  const query = api.video.list.useQuery();

  // Handle loading state - Next.js loading.tsx will display
  if (query.isLoading || !query.data) {
    return null;
  }

  // Handle error state - Next.js error.tsx will catch this
  if (query.error) {
    throw new Error(query.error.message);
  }

  // Validate data shape - this is an actual error if it fails
  if (!isValidVideoList(query.data)) {
    throw new Error("Invalid video data format received from API");
  }

  const videoList: VideoList = query.data;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <Header videoCount={videoList.length} />
        {videoList.length > 0 ? (
          <VideoGrid
            videos={videoList}
            onRefresh={() => void query.refetch()}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </main>
  );
}

/**
 * Header component with video count
 * Single Responsibility: Display page header and upload CTA
 */
function Header({ videoCount }: { videoCount: number }) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-bold">Video Library</h1>
        <p className="mt-2 text-gray-400">
          {videoCount} video{videoCount !== 1 ? "s" : ""}
        </p>
      </div>
      <Button asChild>
        <Link href="/upload">
          <Upload className="mr-2 h-5 w-5" />
          Upload Video
        </Link>
      </Button>
    </div>
  );
}

/**
 * Video grid component
 * Single Responsibility: Render grid of video cards
 */
function VideoGrid({
  videos,
  onRefresh,
}: {
  videos: VideoList;
  onRefresh: () => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} onDelete={onRefresh} />
      ))}
    </div>
  );
}

/**
 * Empty state component
 * Single Responsibility: Display empty library state with CTA
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <VideoIcon className="mb-4 h-20 w-20 text-gray-700" />
      <h2 className="mb-2 text-2xl font-semibold text-gray-400">
        No videos yet
      </h2>
      <p className="mb-6 text-gray-500">
        Upload your first video to get started
      </p>
      <Button asChild size="lg">
        <Link href="/upload">
          <Upload className="mr-2 h-5 w-5" />
          Upload Video
        </Link>
      </Button>
    </div>
  );
}
