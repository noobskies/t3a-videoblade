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
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
import { ArrowBack, Save } from "@mui/icons-material";

export default function EditVideoPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;

  // Fetch video data
  const {
    data: video,
    isLoading,
    error,
  } = api.video.get.useQuery({ id: videoId });

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
  const [privacy, setPrivacy] = useState<"PUBLIC" | "UNLISTED" | "PRIVATE">(
    "UNLISTED",
  );

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

  // Loading state
  if (isLoading) {
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
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    throw new Error(error.message);
  }

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
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
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
                setPrivacy(e.target.value as "PUBLIC" | "UNLISTED" | "PRIVATE")
              }
              fullWidth
              helperText={
                privacy === "PUBLIC"
                  ? "Anyone can find and view"
                  : privacy === "UNLISTED"
                    ? "Only people with the link can view"
                    : "Only you can view"
              }
            >
              <MenuItem value="PUBLIC">Public</MenuItem>
              <MenuItem value="UNLISTED">Unlisted</MenuItem>
              <MenuItem value="PRIVATE">Private</MenuItem>
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
