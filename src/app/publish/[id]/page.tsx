"use client";

/**
 * Video Publish Page
 * Allows user to publish a video to connected platforms
 */

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Youtube } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import Link from "next/link";

export default function PublishPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Unwrap async params (Next.js 15 requirement)
  const { id } = use(params);

  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Get video details
  const videoQuery = api.video.get.useQuery({ id });

  // Get platform connections
  const platformsQuery = api.platform.list.useQuery();

  // Publish mutation
  const publishMutation = api.video.publish.useMutation();

  const handlePublish = async (platformConnectionId: string) => {
    if (!videoQuery.data) return;

    setIsPublishing(true);
    setPublishError(null);
    setPublishSuccess(false);

    try {
      await publishMutation.mutateAsync({
        videoId: id,
        platformConnectionId,
        // Use video's existing metadata
        title: videoQuery.data.title,
        description: videoQuery.data.description ?? undefined,
        tags: videoQuery.data.tags ?? undefined,
        privacy: videoQuery.data.privacy,
      });

      setPublishSuccess(true);

      // Redirect to library after 2 seconds
      setTimeout(() => {
        router.push("/library");
      }, 2000);
    } catch (error) {
      console.error("Publish failed:", error);
      setPublishError(
        error instanceof Error ? error.message : "Failed to publish video",
      );
    } finally {
      setIsPublishing(false);
    }
  };

  // Loading state
  if (videoQuery.isLoading || platformsQuery.isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </main>
    );
  }

  // Error state
  if (videoQuery.error || platformsQuery.error) {
    throw new Error(videoQuery.error?.message ?? platformsQuery.error?.message);
  }

  const video = videoQuery.data;
  const platforms = platformsQuery.data;

  if (!video || !platforms) {
    throw new Error("Data not loaded");
  }

  const youtubePlatform = platforms.find((p) => p.platform === "YOUTUBE");

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/library">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Library
            </Link>
          </Button>
          <h1 className="text-4xl font-bold">Publish Video</h1>
          <p className="mt-2 text-gray-400">
            Select a platform to publish &quot;{video.title}&quot;
          </p>
        </div>

        {/* Success Message */}
        {publishSuccess && (
          <Card className="mb-6 border-green-500 bg-green-950/50">
            <CardContent className="p-4">
              <p className="text-green-400">
                ✓ Publish job created successfully! Redirecting...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {publishError && (
          <Card className="mb-6 border-red-500 bg-red-950/50">
            <CardContent className="p-4">
              <p className="text-red-400">✗ {publishError}</p>
            </CardContent>
          </Card>
        )}

        {/* Video Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Video Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="text-gray-400">Title:</span>{" "}
                <span className="font-medium">{video.title}</span>
              </div>
              {video.description && (
                <div>
                  <span className="text-gray-400">Description:</span>{" "}
                  <span className="text-sm">{video.description}</span>
                </div>
              )}
              <div>
                <span className="text-gray-400">Privacy:</span>{" "}
                <Badge variant="outline">{video.privacy}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Selection */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Select Platform</h2>

          {/* YouTube */}
          {youtubePlatform ? (
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <Youtube className="h-10 w-10 text-red-500" />
                  <div>
                    <h3 className="text-lg font-semibold">YouTube</h3>
                    <p className="text-sm text-gray-400">
                      Connected as{" "}
                      {youtubePlatform.platformUsername ?? "YouTube"}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handlePublish(youtubePlatform.id)}
                  disabled={isPublishing || publishSuccess}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isPublishing ? "Publishing..." : "Publish to YouTube"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <Youtube className="h-10 w-10 text-gray-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-400">
                      YouTube
                    </h3>
                    <p className="text-sm text-gray-500">Not connected</p>
                  </div>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/platforms">Connect YouTube</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 rounded-lg border border-blue-500/20 bg-blue-950/20 p-4">
          <p className="text-sm text-blue-300">
            ℹ️ Publishing happens in the background. You can continue using
            VideoBlade while your video uploads to the platform. Check the video
            library for publish status updates.
          </p>
        </div>
      </div>
    </main>
  );
}
