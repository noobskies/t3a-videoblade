"use client";

/**
 * Video Publish Page
 * Allows user to publish a video to connected platforms
 */

import { api } from "@/trpc/react";
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  YouTube as YouTubeIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Container,
  Link as MuiLink,
  Stack,
  Typography,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

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
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Error state
  if (videoQuery.error || platformsQuery.error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">
          {videoQuery.error?.message ?? platformsQuery.error?.message}
        </Alert>
      </Container>
    );
  }

  const video = videoQuery.data;
  const platforms = platformsQuery.data;

  if (!video || !platforms) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">Data not loaded</Alert>
      </Container>
    );
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
    <Container maxWidth="md" sx={{ py: 8 }}>
      {/* Header */}
      <Box mb={4}>
        <Button
          component={Link}
          href="/library"
          variant="text"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Library
        </Button>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Publish Video
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Select a platform to publish &quot;{video.title}&quot;
        </Typography>
      </Box>

      <Stack spacing={4}>
        {/* Success Message */}
        {publishSuccess && (
          <Alert severity="success">
            Publish job created successfully! Redirecting...
          </Alert>
        )}

        {/* Error Message */}
        {publishError && <Alert severity="error">{publishError}</Alert>}

        {/* Video Info */}
        <Card>
          <CardHeader title="Video Details" />
          <CardContent>
            <Stack spacing={3}>
              {/* Thumbnail */}
              {video.thumbnailUrl && (
                <Box
                  sx={{
                    width: "100%",
                    position: "relative",
                    paddingTop: "56.25%", // 16:9 aspect ratio
                    bgcolor: "action.hover",
                    borderRadius: 1,
                    overflow: "hidden",
                  }}
                >
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.title}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </Box>
              )}

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Title
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {video.title}
                </Typography>
              </Box>
              {video.description && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                    {video.description}
                  </Typography>
                </Box>
              )}
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Privacy
                </Typography>
                <Chip label={video.privacy} variant="outlined" size="small" />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Platform Selection */}
        <Box>
          <Typography variant="h5" gutterBottom fontWeight="semibold">
            Select Platform
          </Typography>

          {/* YouTube */}
          <Card>
            <CardContent>
              {youtubePlatform ? (
                <Stack spacing={3}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={2}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <YouTubeIcon sx={{ fontSize: 40, color: "error.main" }} />
                      <Box>
                        <Typography variant="h6">YouTube</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Connected as{" "}
                          {youtubePlatform.platformUsername ?? "YouTube"}
                        </Typography>
                      </Box>
                    </Stack>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handlePublish(youtubePlatform.id)}
                      disabled={isPublishing || publishSuccess}
                      startIcon={<SendIcon />}
                    >
                      {isPublishing
                        ? isUpdate
                          ? "Updating..."
                          : "Publishing..."
                        : isUpdate
                          ? "Update on YouTube"
                          : "Publish to YouTube"}
                    </Button>
                  </Stack>

                  {isUpdate && existingYouTubePublish && (
                    <Alert severity="warning" sx={{ alignItems: "center" }}>
                      <Typography variant="body2" gutterBottom>
                        This video is already on YouTube. Clicking will update
                        the existing video&apos;s metadata (title, description,
                        tags, privacy) without re-uploading the file.
                      </Typography>
                      {existingYouTubePublish.platformVideoUrl && (
                        <Typography variant="caption">
                          Video URL:{" "}
                          <MuiLink
                            href={existingYouTubePublish.platformVideoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            color="inherit"
                            underline="always"
                          >
                            {existingYouTubePublish.platformVideoUrl}
                          </MuiLink>
                        </Typography>
                      )}
                    </Alert>
                  )}
                </Stack>
              ) : (
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={2}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <YouTubeIcon
                      sx={{ fontSize: 40, color: "text.disabled" }}
                    />
                    <Box>
                      <Typography variant="h6" color="text.disabled">
                        YouTube
                      </Typography>
                      <Typography variant="body2" color="text.disabled">
                        Not connected
                      </Typography>
                    </Box>
                  </Stack>
                  <Button component={Link} href="/platforms" variant="outlined">
                    Connect YouTube
                  </Button>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Info */}
        <Alert severity="info">
          Publishing happens in the background. You can continue using
          VideoBlade while your video uploads to the platform. Check the video
          library for publish status updates.
        </Alert>
      </Stack>
    </Container>
  );
}
