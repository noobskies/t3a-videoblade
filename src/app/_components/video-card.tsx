"use client";

import { api } from "@/trpc/react";
import { useState } from "react";
import { Video as VideoIcon } from "lucide-react";
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Chip,
  Stack,
  Box,
} from "@mui/material";
import { Delete, Edit, Upload } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import type { VideoListItem } from "@/lib/types";

type VideoCardProps = {
  video: VideoListItem;
  onDelete: () => void;
};

export function VideoCard({ video, onDelete }: VideoCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteVideo = api.video.delete.useMutation();

  const formatFileSize = (bytes: string) => {
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

  const handleDelete = async () => {
    if (!confirm(`Delete "${video.title}"?`)) return;

    setIsDeleting(true);
    try {
      await deleteVideo.mutateAsync({ id: video.id });
      onDelete();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete video");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (
    status: string,
  ): "success" | "info" | "error" | "warning" | "default" => {
    switch (status) {
      case "COMPLETED":
        return "success"; // green
      case "PROCESSING":
        return "info"; // blue
      case "FAILED":
        return "error"; // red
      case "PENDING":
        return "warning"; // yellow
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
        transition: "border-color 0.2s",
        "&:hover": {
          borderColor: "primary.main",
          borderWidth: 2,
        },
      }}
    >
      {/* Thumbnail */}
      <CardMedia
        component="div"
        sx={{
          height: 200,
          bgcolor: "grey.200",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {video.thumbnailUrl ? (
          <Box
            component="img"
            src={video.thumbnailUrl}
            alt={video.title}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <VideoIcon style={{ fontSize: 48, color: "rgba(0,0,0,0.3)" }} />
        )}
      </CardMedia>

      {/* Content */}
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Title */}
        <Typography variant="h6" component="h3" noWrap gutterBottom>
          {video.title}
        </Typography>

        {/* Description */}
        {video.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              mb: 1,
            }}
          >
            {video.description}
          </Typography>
        )}

        {/* Metadata */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 1 }}
        >
          {formatFileSize(video.fileSize)} • {formatDate(video.createdAt)} •{" "}
          {video.privacy.toLowerCase()}
        </Typography>

        {/* Publish Status */}
        {video.publishJobs.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
            {video.publishJobs.map((job) => (
              <Chip
                key={job.platform}
                label={`${job.platform}: ${job.status}`}
                color={getStatusColor(job.status)}
                size="small"
              />
            ))}
          </Stack>
        )}
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          variant="contained"
          startIcon={<Upload />}
          onClick={() => router.push(`/publish/${video.id}`)}
          sx={{ flexGrow: 1 }}
        >
          Publish
        </Button>
        <IconButton
          onClick={() => router.push(`/video/${video.id}/edit`)}
          aria-label="edit video"
        >
          <Edit />
        </IconButton>
        <IconButton
          color="error"
          onClick={handleDelete}
          disabled={isDeleting}
          aria-label="delete video"
        >
          <Delete />
        </IconButton>
      </CardActions>
    </Card>
  );
}
