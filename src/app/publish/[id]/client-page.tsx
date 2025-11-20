"use client";

/**
 * Multi-Platform Publish Page
 * Allows user to publish a video to multiple platforms simultaneously
 */

import { api } from "@/trpc/react";
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  MusicNote as MusicNoteIcon,
  Send as SendIcon,
  YouTube as YouTubeIcon,
  OndemandVideo as VimeoIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs, { type Dayjs } from "dayjs";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Platform = "YOUTUBE" | "TIKTOK" | "VIMEO";
type Privacy = "PUBLIC" | "UNLISTED" | "PRIVATE" | "MUTUAL_FOLLOW_FRIENDS";

interface PlatformMetadata {
  title: string;
  description: string;
  privacy: Privacy;
  tags?: string;
}

export function PublishPage({ id }: { id: string }) {
  const router = useRouter();
  const theme = useTheme();

  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [metadata, setMetadata] = useState<Record<string, PlatformMetadata>>(
    {},
  );
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Scheduling state
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Dayjs | null>(
    dayjs().add(1, "day"),
  );

  // Get video details
  const [video] = api.video.get.useSuspenseQuery({ id });

  // Get platform connections
  const [platforms] = api.platform.list.useSuspenseQuery();

  // Publish mutation
  const publishMultiMutation = api.video.publishMulti.useMutation();

  const youtubeConnected = platforms.some((c) => c.platform === "YOUTUBE");
  const tiktokConnected = platforms.some((c) => c.platform === "TIKTOK");
  const vimeoConnected = platforms.some((c) => c.platform === "VIMEO");

  // Toggle platform selection
  const togglePlatform = (platform: Platform) => {
    if (!video) return;

    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== platform));
      const newMetadata = { ...metadata };
      delete newMetadata[platform];
      setMetadata(newMetadata);
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
      // Initialize metadata with video defaults
      setMetadata({
        ...metadata,
        [platform]: {
          title: video.title,
          description: video.description ?? "",
          // Default privacy
          privacy: video.privacy as Privacy,
          tags: video.tags ?? "",
        },
      });
    }
  };

  // Update metadata for a specific platform
  const updateMetadata = (
    platform: Platform,
    field: keyof PlatformMetadata,
    value: string,
  ) => {
    setMetadata({
      ...metadata,
      [platform]: {
        ...metadata[platform]!,
        [field]: value,
      },
    });
  };

  const handlePublish = async () => {
    if (selectedPlatforms.length === 0) return;

    setIsPublishing(true);
    setPublishError(null);
    setPublishSuccess(false);

    try {
      // Prepare metadata payload
      const metadataPayload: Record<
        string,
        {
          title?: string;
          description?: string;
          tags?: string;
          privacy?: "PUBLIC" | "UNLISTED" | "PRIVATE" | "MUTUAL_FOLLOW_FRIENDS";
        }
      > = {};

      selectedPlatforms.forEach((platform) => {
        const data = metadata[platform];
        if (data) {
          metadataPayload[platform] = {
            title: data.title,
            description: data.description,
            tags: data.tags,
            privacy: data.privacy,
          };
        }
      });

      const result = await publishMultiMutation.mutateAsync({
        videoId: id,
        platforms: selectedPlatforms,
        metadata: metadataPayload,
        scheduledPublishAt:
          isScheduled && scheduledDate ? scheduledDate.toDate() : undefined,
      });

      setPublishSuccess(true);
      console.log("Publish jobs created:", result.jobIds);

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

  if (!video) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Alert severity="error">Video not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
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
          Select platforms to publish &quot;{video.title}&quot;
        </Typography>
      </Box>

      <Stack spacing={4}>
        {/* Success Message */}
        {publishSuccess && (
          <Alert severity="success">
            Publishing started! Redirecting to library...
          </Alert>
        )}

        {/* Error Message */}
        {publishError && <Alert severity="error">{publishError}</Alert>}

        {/* Video Summary */}
        <Card variant="outlined">
          <Stack direction="row" spacing={2} p={2} alignItems="center">
            {video.thumbnailUrl && (
              <Box
                sx={{
                  width: 120,
                  height: 68,
                  position: "relative",
                  bgcolor: "action.hover",
                  borderRadius: 1,
                  overflow: "hidden",
                  flexShrink: 0,
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
              <Typography variant="subtitle1" fontWeight="bold" noWrap>
                {video.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {video.duration
                  ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, "0")}`
                  : "Ready to publish"}
              </Typography>
            </Box>
          </Stack>
        </Card>

        {/* Platform Selection */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Select Platforms
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            {/* YouTube Card */}
            <Card
              onClick={() =>
                youtubeConnected && !isPublishing && togglePlatform("YOUTUBE")
              }
              sx={{
                flex: 1,
                cursor: youtubeConnected ? "pointer" : "not-allowed",
                border: selectedPlatforms.includes("YOUTUBE")
                  ? `2px solid ${theme.palette.primary.main}`
                  : undefined,
                opacity: youtubeConnected ? 1 : 0.7,
                position: "relative",
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <YouTubeIcon sx={{ fontSize: 40, color: "error.main" }} />
                  <Box flex={1}>
                    <Typography variant="h6">YouTube</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {youtubeConnected ? "Connected" : "Not connected"}
                    </Typography>
                  </Box>
                  {selectedPlatforms.includes("YOUTUBE") && (
                    <CheckCircleIcon color="primary" />
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* TikTok Card */}
            <Card
              onClick={() =>
                tiktokConnected && !isPublishing && togglePlatform("TIKTOK")
              }
              sx={{
                flex: 1,
                cursor: tiktokConnected ? "pointer" : "not-allowed",
                border: selectedPlatforms.includes("TIKTOK")
                  ? `2px solid ${theme.palette.secondary.main}` // Using secondary or pink-ish if available
                  : undefined,
                opacity: tiktokConnected ? 1 : 0.7,
                position: "relative",
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  {/* Using MusicNote as TikTok placeholder as per activeContext */}
                  <MusicNoteIcon
                    sx={{ fontSize: 40, color: "secondary.main" }}
                  />
                  <Box flex={1}>
                    <Typography variant="h6">TikTok</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {tiktokConnected ? "Connected" : "Not connected"}
                    </Typography>
                  </Box>
                  {selectedPlatforms.includes("TIKTOK") && (
                    <CheckCircleIcon color="secondary" />
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Vimeo Card */}
            <Card
              onClick={() =>
                vimeoConnected && !isPublishing && togglePlatform("VIMEO")
              }
              sx={{
                flex: 1,
                cursor: vimeoConnected ? "pointer" : "not-allowed",
                border: selectedPlatforms.includes("VIMEO")
                  ? `2px solid ${theme.palette.info.main}`
                  : undefined,
                opacity: vimeoConnected ? 1 : 0.7,
                position: "relative",
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <VimeoIcon sx={{ fontSize: 40, color: "info.main" }} />
                  <Box flex={1}>
                    <Typography variant="h6">Vimeo</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {vimeoConnected ? "Connected" : "Not connected"}
                    </Typography>
                  </Box>
                  {selectedPlatforms.includes("VIMEO") && (
                    <CheckCircleIcon color="info" />
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
          {!youtubeConnected && !tiktokConnected && !vimeoConnected && (
            <Button
              component={Link}
              href="/platforms"
              variant="outlined"
              sx={{ mt: 2 }}
            >
              Connect Platforms
            </Button>
          )}
        </Box>

        {/* Metadata Configuration */}
        {selectedPlatforms.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configure Metadata
            </Typography>
            <Stack spacing={3}>
              {selectedPlatforms.map((platform) => (
                <Card key={platform} variant="outlined">
                  <CardHeader
                    avatar={
                      platform === "YOUTUBE" ? (
                        <YouTubeIcon color="error" />
                      ) : platform === "TIKTOK" ? (
                        <MusicNoteIcon color="secondary" />
                      ) : (
                        <VimeoIcon color="info" />
                      )
                    }
                    title={`${platform === "YOUTUBE" ? "YouTube" : platform === "TIKTOK" ? "TikTok" : "Vimeo"} Settings`}
                  />
                  <CardContent>
                    <Stack spacing={2}>
                      <TextField
                        label="Title"
                        fullWidth
                        value={metadata[platform]?.title ?? ""}
                        onChange={(e) =>
                          updateMetadata(platform, "title", e.target.value)
                        }
                      />
                      <TextField
                        label="Description"
                        fullWidth
                        multiline
                        rows={4}
                        value={metadata[platform]?.description ?? ""}
                        onChange={(e) =>
                          updateMetadata(
                            platform,
                            "description",
                            e.target.value,
                          )
                        }
                      />
                      {platform === "YOUTUBE" && (
                        <TextField
                          label="Tags (comma separated)"
                          fullWidth
                          value={metadata[platform]?.tags ?? ""}
                          onChange={(e) =>
                            updateMetadata(platform, "tags", e.target.value)
                          }
                          helperText="e.g., vlog, tech, tutorial"
                        />
                      )}
                      <FormControl fullWidth>
                        <InputLabel>Privacy</InputLabel>
                        <Select
                          value={metadata[platform]?.privacy ?? "UNLISTED"}
                          label="Privacy"
                          onChange={(e) =>
                            updateMetadata(
                              platform,
                              "privacy",
                              e.target.value as Privacy,
                            )
                          }
                        >
                          {platform === "TIKTOK"
                            ? [
                                <MenuItem key="PUBLIC" value="PUBLIC">
                                  Public (Everyone)
                                </MenuItem>,
                                <MenuItem key="PRIVATE" value="PRIVATE">
                                  Private (Self Only)
                                </MenuItem>,
                                <MenuItem
                                  key="MUTUAL_FOLLOW_FRIENDS"
                                  value="MUTUAL_FOLLOW_FRIENDS"
                                >
                                  Friends (Mutual Followers)
                                </MenuItem>,
                              ]
                            : [
                                <MenuItem key="PUBLIC" value="PUBLIC">
                                  Public
                                </MenuItem>,
                                <MenuItem key="UNLISTED" value="UNLISTED">
                                  Unlisted
                                </MenuItem>,
                                <MenuItem key="PRIVATE" value="PRIVATE">
                                  Private
                                </MenuItem>,
                              ]}
                        </Select>
                      </FormControl>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        )}

        {/* Scheduling */}
        {selectedPlatforms.length > 0 && (
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isScheduled}
                      onChange={(e) => setIsScheduled(e.target.checked)}
                    />
                  }
                  label="Schedule for later"
                />
                {isScheduled && (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                      label="Publish Date & Time"
                      value={scheduledDate}
                      onChange={(newValue) => setScheduledDate(newValue)}
                      disablePast
                    />
                  </LocalizationProvider>
                )}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Publish Action */}
        <Box>
          <Button
            variant="contained"
            size="large"
            fullWidth
            disabled={
              selectedPlatforms.length === 0 || isPublishing || publishSuccess
            }
            onClick={handlePublish}
            startIcon={
              isPublishing ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SendIcon />
              )
            }
          >
            {isPublishing
              ? "Publishing..."
              : `Publish to ${selectedPlatforms.length} Platform${selectedPlatforms.length !== 1 ? "s" : ""}`}
          </Button>
          <Typography
            variant="caption"
            color="text.secondary"
            align="center"
            display="block"
            sx={{ mt: 1 }}
          >
            {selectedPlatforms.length === 0
              ? "Select at least one platform to publish"
              : "Videos will be queued for background publishing"}
          </Typography>
        </Box>
      </Stack>
    </Container>
  );
}
