"use client";

/**
 * Video Publish Page
 * Allows user to publish a video to connected platforms
 */

import { api } from "@/trpc/react";
import {
  Button,
  Chip,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Stack,
  Alert,
  Container,
} from "@mui/material";
import { ArrowBack, Send, YouTube } from "@mui/icons-material";
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
      const result = await publishMutation.mutateAsync({
        videoId: id,
        platformConnectionId,
        // Use video's existing metadata
        title: videoQuery.data.title,
        description: videoQuery.data.description ?? undefined,
        tags: videoQuery.data.tags ?? undefined,
        privacy: videoQuery.data.privacy,
      });

      setPublishSuccess(true);

      // Show appropriate success message
      console.log(
        result.isUpdate ? "Update job created" : "Publish job created",
      );

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
      <Container maxWidth="lg" component="main" sx={{ py: 4 }}>
        <Typography align="center">Loading...</Typography>
      </Container>
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

  // Check if video has already been published to YouTube
  const existingYouTubePublish = video.publishJobs?.find(
    (job) =>
      job.platformConnection.platform === "YOUTUBE" &&
      job.status === "COMPLETED" &&
      job.platformVideoId,
  );

  const isUpdate = !!existingYouTubePublish;

  return (
    <Container maxWidth="lg" component="main" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Button
            component={Link}
            href="/library"
            startIcon={<ArrowBack />}
            sx={{ mb: 2 }}
          >
            Back to Library
          </Button>
          <Typography variant="h4" component="h1" gutterBottom>
            Publish Video
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select a platform to publish &quot;{video.title}&quot;
          </Typography>
        </Box>

        {/* Success Message */}
        {publishSuccess && (
          <Alert severity="success">
            ✓ Publish job created successfully! Redirecting...
          </Alert>
        )}

        {/* Error Message */}
        {publishError && <Alert severity="error">✗ {publishError}</Alert>}

        {/* Video Info */}
        <Card>
          <CardHeader title="Video Details" />
          <CardContent>
            <Stack spacing={1}>
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  component="span"
                >
                  Title:{" "}
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="medium"
                  component="span"
                >
                  {video.title}
                </Typography>
              </Box>
              {video.description && (
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    component="span"
                  >
                    Description:{" "}
                  </Typography>
                  <Typography variant="body2" component="span">
                    {video.description}
                  </Typography>
                </Box>
              )}
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  component="span"
                  sx={{ mr: 1 }}
                >
                  Privacy:
                </Typography>
                <Chip label={video.privacy} variant="outlined" size="small" />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Platform Selection */}
        <Box>
          <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
            Select Platform
          </Typography>

          {/* YouTube */}
          {youtubePlatform ? (
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <YouTube sx={{ fontSize: 40, color: "error.main" }} />
                      <Box>
                        <Typography variant="h6" component="h3">
                          YouTube
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Connected as{" "}
                          {youtubePlatform.platformUsername ?? "YouTube"}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<Send />}
                      onClick={() => handlePublish(youtubePlatform.id)}
                      disabled={isPublishing || publishSuccess}
                    >
                      {isPublishing
                        ? isUpdate
                          ? "Updating..."
                          : "Publishing..."
                        : isUpdate
                          ? "Update on YouTube"
                          : "Publish to YouTube"}
                    </Button>
                  </Box>
                  {isUpdate && existingYouTubePublish && (
                    <Alert severity="warning">
                      <Typography variant="body2" gutterBottom>
                        ⚠️ This video is already on YouTube. Clicking will
                        update the existing video&apos;s metadata (title,
                        description, tags, privacy) without re-uploading the
                        file.
                      </Typography>
                      <Typography variant="caption">
                        Video URL:{" "}
                        <a
                          href={existingYouTubePublish.platformVideoUrl ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: "underline" }}
                        >
                          {existingYouTubePublish.platformVideoUrl}
                        </a>
                      </Typography>
                    </Alert>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <YouTube sx={{ fontSize: 40, color: "text.disabled" }} />
                    <Box>
                      <Typography
                        variant="h6"
                        component="h3"
                        color="text.secondary"
                      >
                        YouTube
                      </Typography>
                      <Typography variant="body2" color="text.disabled">
                        Not connected
                      </Typography>
                    </Box>
                  </Box>
                  <Button variant="outlined" component={Link} href="/platforms">
                    Connect YouTube
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Info */}
        <Alert severity="info">
          ℹ️ Publishing happens in the background. You can continue using
          VideoBlade while your video uploads to the platform. Check the video
          library for publish status updates.
        </Alert>
      </Stack>
    </Container>
  );
}
