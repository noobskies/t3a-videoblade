"use client";

import Image from "next/image";
import { api } from "@/trpc/react";
import { useState } from "react";
import {
  Movie as VideoIcon,
  Delete as Trash2,
  Edit,
  CloudUpload as Upload,
  Replay as RetryIcon,
} from "@mui/icons-material";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Typography,
  Box,
  Chip,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import type { PostListItem } from "@/lib/types";

type PostCardProps = {
  post: PostListItem;
  onDelete: () => void;
};

export function PostCard({ post, onDelete }: PostCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteFromPlatforms, setDeleteFromPlatforms] = useState(false);

  const deleteVideo = api.post.delete.useMutation();
  const retryPublish = api.post.retryPublish.useMutation();

  const hasPublishedJobs = post.publishJobs.some(
    (job) => job.status === "COMPLETED",
  );

  const formatFileSize = (bytes: string | null) => {
    if (!bytes) return "0 B";
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

  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
    setDeleteFromPlatforms(false);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    setDeleteDialogOpen(false);
    setIsDeleting(true);
    try {
      await deleteVideo.mutateAsync({
        id: post.id,
        deleteFromPlatforms: deleteFromPlatforms,
      });
      onDelete();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete video");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRetry = async (jobId: string) => {
    try {
      await retryPublish.mutateAsync({ jobId });
      onDelete(); // Refetch to update status
      alert("Retrying publish...");
    } catch (error) {
      console.error("Retry failed:", error);
      alert("Failed to retry");
    }
  };

  const getStatusColor = (
    status: string,
  ):
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning" => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "PROCESSING":
        return "info";
      case "FAILED":
        return "error";
      case "PENDING":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
      }}
    >
      {/* Thumbnail Area */}
      <Box
        sx={{
          position: "relative",
          paddingTop: "56.25%",
          bgcolor: "action.hover",
        }}
      >
        {post.thumbnailUrl ? (
          <Image
            src={post.thumbnailUrl}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
              color: "text.secondary",
            }}
          >
            <VideoIcon sx={{ fontSize: 48, opacity: 0.5 }} />
          </Box>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* Title */}
        <Typography
          variant="h6"
          component="h3"
          noWrap
          gutterBottom
          title={post.title}
        >
          {post.title}
        </Typography>

        {/* Description */}
        {post.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              height: "40px", // Approx 2 lines
            }}
          >
            {post.description}
          </Typography>
        )}

        {/* Metadata */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ mb: 2, color: "text.secondary" }}
        >
          <Typography variant="caption">
            {formatFileSize(post.fileSize)}
          </Typography>
          <Typography variant="caption">•</Typography>
          <Typography variant="caption">
            {formatDate(post.createdAt)}
          </Typography>
          <Typography variant="caption">•</Typography>
          <Typography variant="caption" sx={{ textTransform: "capitalize" }}>
            {post.privacy.toLowerCase()}
          </Typography>
        </Stack>

        {/* Publish Status Chips */}
        {post.publishJobs.length > 0 && (
          <Stack spacing={1}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {post.publishJobs.map((job) => (
                <Chip
                  key={job.platform}
                  label={`${job.platform}: ${job.status}`}
                  size="small"
                  color={getStatusColor(job.status)}
                  variant="outlined"
                  deleteIcon={<RetryIcon />}
                  onDelete={
                    job.status === "FAILED"
                      ? () => handleRetry(job.id)
                      : undefined
                  }
                />
              ))}
            </Box>

            {/* Error Messages */}
            {post.publishJobs
              .filter((j) => j.status === "FAILED" && j.errorMessage)
              .map((job) => (
                <Alert
                  key={`error-${job.id}`}
                  severity="error"
                  variant="outlined"
                  sx={{
                    py: 0,
                    px: 1,
                    "& .MuiAlert-message": { fontSize: "0.75rem" },
                  }}
                >
                  {job.platform}: {job.errorMessage}
                </Alert>
              ))}
          </Stack>
        )}
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          variant="contained"
          startIcon={<Upload />}
          href={`/publish/${post.id}`}
          fullWidth
        >
          Publish
        </Button>
        <IconButton
          aria-label="edit"
          href={`/post/${post.id}/edit`}
          size="small"
          sx={{ ml: 1 }}
        >
          <Edit fontSize="small" />
        </IconButton>
        <IconButton
          aria-label="delete"
          onClick={handleOpenDeleteDialog}
          disabled={isDeleting}
          size="small"
          color="error"
        >
          <Trash2 fontSize="small" />
        </IconButton>
      </CardActions>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          {`Delete "${post.title}"?`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description" gutterBottom>
            This action cannot be undone. This will permanently delete:
          </DialogContentText>
          <Box component="ul" sx={{ pl: 2, mt: 0 }}>
            <li>
              <Typography variant="body2">
                The video file from cloud storage
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                All metadata and history from VideoBlade
              </Typography>
            </li>
          </Box>

          {hasPublishedJobs && (
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={deleteFromPlatforms}
                    onChange={(e) => setDeleteFromPlatforms(e.target.checked)}
                    color="error"
                  />
                }
                label="Also delete from connected platforms (YouTube, etc.)"
              />
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Note: Only supported on platforms that allow API deletion (e.g.
                YouTube). TikTok videos may need to be deleted manually.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} autoFocus>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
