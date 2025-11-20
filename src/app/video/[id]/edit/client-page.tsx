"use client";

import { api } from "@/trpc/react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Stack,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
  Alert,
  IconButton,
} from "@mui/material";
import { ArrowBack, Save, Movie as MovieIcon } from "@mui/icons-material";
import Image from "next/image";

export function EditVideoPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;

  // Fetch video data
  const [video] = api.video.get.useSuspenseQuery({ id: videoId });

  // Update mutation
  const updateVideo = api.video.update.useMutation({
    onSuccess: () => {
      router.push("/library");
    },
  });

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [privacy, setPrivacy] = useState<
    "PUBLIC" | "UNLISTED" | "PRIVATE" | "MUTUAL_FOLLOW_FRIENDS"
  >("UNLISTED");

  // Initialize form when video loads
  useEffect(() => {
    if (video) {
      setTitle(video.title);
      setDescription(video.description ?? "");
      setTags(video.tags ?? "");
      setPrivacy(video.privacy);
    }
  }, [video]);

  const handleSave = () => {
    if (!title.trim()) {
      return;
    }

    updateVideo.mutate({
      id: videoId,
      title: title.trim(),
      description: description.trim() || undefined,
      tags: tags.trim() || undefined,
      privacy,
    });
  };

  const handleCancel = () => {
    router.push("/library");
  };

  if (!video) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
        }}
      >
        <Alert severity="error">Video not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 3 }}>
      <Container maxWidth="md">
        {/* Header */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <IconButton onClick={handleCancel} edge="start">
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Edit Video
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {video.fileName}
            </Typography>
          </Box>
        </Stack>

        {/* Edit Form */}
        <Paper elevation={1} sx={{ p: 4 }}>
          <Stack spacing={4}>
            {/* Thumbnail */}
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
              {video.thumbnailUrl ? (
                <Image
                  src={video.thumbnailUrl}
                  alt={video.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    color: "text.secondary",
                  }}
                >
                  <MovieIcon sx={{ fontSize: 64, opacity: 0.5, mb: 1 }} />
                  <Typography variant="body2">
                    No thumbnail available
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Title */}
            <TextField
              label="Title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              fullWidth
              helperText={`${title.length}/100 characters`}
              error={!title.trim() && title.length > 0}
              slotProps={{
                htmlInput: { maxLength: 100 },
              }}
            />

            {/* Description */}
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter video description"
              multiline
              rows={6}
              fullWidth
              helperText={`${description.length}/5000 characters`}
              slotProps={{
                htmlInput: { maxLength: 5000 },
              }}
            />

            {/* Tags */}
            <TextField
              label="Tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tech, tutorial, coding (comma-separated)"
              fullWidth
              helperText={`${tags.length}/500 characters`}
              slotProps={{
                htmlInput: { maxLength: 500 },
              }}
            />

            {/* Privacy */}
            <TextField
              select
              label="Privacy"
              value={privacy}
              onChange={(e) =>
                setPrivacy(
                  e.target.value as
                    | "PUBLIC"
                    | "UNLISTED"
                    | "PRIVATE"
                    | "MUTUAL_FOLLOW_FRIENDS",
                )
              }
              fullWidth
              helperText={
                privacy === "PUBLIC"
                  ? "Anyone can find and view"
                  : privacy === "UNLISTED"
                    ? "Only people with the link can view"
                    : privacy === "MUTUAL_FOLLOW_FRIENDS"
                      ? "Only friends can view"
                      : "Only you can view"
              }
            >
              <MenuItem value="PUBLIC">Public</MenuItem>
              <MenuItem value="UNLISTED">Unlisted</MenuItem>
              <MenuItem value="PRIVATE">Private</MenuItem>
              <MenuItem value="MUTUAL_FOLLOW_FRIENDS">
                Mutual Follow Friends
              </MenuItem>
            </TextField>

            {/* Actions */}
            <Stack direction="row" spacing={2} pt={2}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={updateVideo.isPending || !title.trim()}
                startIcon={<Save />}
                sx={{ flex: 1 }}
              >
                {updateVideo.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={updateVideo.isPending}
              >
                Cancel
              </Button>
            </Stack>

            {/* Error message */}
            {updateVideo.error && (
              <Alert severity="error">
                Failed to update video: {updateVideo.error.message}
              </Alert>
            )}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
