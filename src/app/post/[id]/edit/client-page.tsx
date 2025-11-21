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
  const [video] = api.post.get.useSuspenseQuery({ id: videoId });

  // Update mutation
  const updateVideo = api.post.update.useMutation({
    onSuccess: () => {
      router.push("/library");
    },
  });

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [privacy, setPrivacy] = useState<
    "PUBLIC" | "UNLISTED" | "PRIVATE" | "MUTUAL_FOLLOW_FRIENDS"
  >("UNLISTED");

  // Initialize form when video loads
  useEffect(() => {
    if (video) {
      setTitle(video.title ?? "");
      setDescription(video.description ?? "");
      setContent(video.content ?? "");
      setTags(video.tags ?? "");
      setPrivacy(video.privacy);
    }
  }, [video]);

  const handleSave = (convertToPost = false) => {
    // For Ideas, title is optional. For Posts, it's required.
    if (convertToPost && !title.trim()) {
      alert("Title is required to convert to a post");
      return;
    }

    // If it's currently an idea but user didn't click convert, keeping it as idea (unless validation fails?)
    // Actually we allow saving ideas without title.

    updateVideo.mutate({
      id: videoId,
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      content: content.trim() || undefined,
      tags: tags.trim() || undefined,
      privacy,
      isIdea: convertToPost ? false : video.isIdea,
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
              {video.isIdea ? "Edit Idea" : "Edit Post"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {video.fileName ?? (video.isIdea ? "Draft Idea" : "Untitled")}
            </Typography>
          </Box>
        </Stack>

        {/* Edit Form */}
        <Paper elevation={1} sx={{ p: 4 }}>
          <Stack spacing={4}>
            {/* Thumbnail (Only for Media types) */}
            {video.type !== "TEXT" && (
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
                    alt={video.title ?? "Thumbnail"}
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
            )}

            {/* Title */}
            <TextField
              label="Title"
              required={!video.isIdea}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title"
              fullWidth
              helperText={`${title.length}/100 characters`}
              error={!video.isIdea && !title.trim() && title.length > 0}
              slotProps={{
                htmlInput: { maxLength: 100 },
              }}
            />

            {/* Content (For Text Posts/Ideas) */}
            {video.type === "TEXT" && (
              <TextField
                label="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post content..."
                multiline
                rows={6}
                fullWidth
              />
            )}

            {/* Description (For Media Posts) */}
            {video.type !== "TEXT" && (
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
            )}

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
                onClick={() => handleSave(false)}
                disabled={
                  updateVideo.isPending || (!video.isIdea && !title.trim())
                }
                startIcon={<Save />}
                sx={{ flex: 1 }}
              >
                {updateVideo.isPending ? "Saving..." : "Save Changes"}
              </Button>

              {video.isIdea && (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleSave(true)}
                  disabled={updateVideo.isPending || !title.trim()}
                  sx={{ flex: 1 }}
                >
                  Convert to Post
                </Button>
              )}

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
