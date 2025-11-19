"use client";

import { api } from "@/trpc/react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
  Paper,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Container,
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
      alert("Title is required");
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
      <Container maxWidth="md" component="main" sx={{ py: 4 }}>
        <Typography align="center">Loading video...</Typography>
      </Container>
    );
  }

  // Error state
  if (error) {
    throw new Error(error.message);
  }

  if (!video) {
    return (
      <Container maxWidth="md" component="main" sx={{ py: 4 }}>
        <Typography align="center">Video not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" component="main" sx={{ py: 4 }}>
      {/* Header */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
        <IconButton onClick={handleCancel} aria-label="back to library">
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Edit Video
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {video.fileName}
          </Typography>
        </Box>
      </Stack>

      {/* Edit Form */}
      <Paper sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Title */}
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter video title"
            required
            fullWidth
            inputProps={{ maxLength: 100 }}
            helperText={`${title.length}/100 characters`}
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
            inputProps={{ maxLength: 5000 }}
            helperText={`${description.length}/5,000 characters`}
          />

          {/* Tags */}
          <TextField
            label="Tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tech, tutorial, coding (comma-separated)"
            fullWidth
            inputProps={{ maxLength: 500 }}
            helperText={`${tags.length}/500 characters`}
          />

          {/* Privacy */}
          <FormControl fullWidth>
            <InputLabel id="privacy-label">Privacy</InputLabel>
            <Select
              labelId="privacy-label"
              id="privacy"
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              label="Privacy"
            >
              <MenuItem value="PUBLIC">
                Public - Anyone can find and view
              </MenuItem>
              <MenuItem value="UNLISTED">
                Unlisted - Only people with the link can view
              </MenuItem>
              <MenuItem value="PRIVATE">Private - Only you can view</MenuItem>
            </Select>
            <FormHelperText>Choose who can view this video</FormHelperText>
          </FormControl>

          {/* Actions */}
          <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={updateVideo.isPending || !title.trim()}
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
            <Paper
              sx={{
                p: 2,
                bgcolor: "error.dark",
                color: "error.contrastText",
              }}
            >
              <Typography variant="body2">
                Failed to update video: {updateVideo.error.message}
              </Typography>
            </Paper>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}
