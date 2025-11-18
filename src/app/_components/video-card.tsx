"use client";

import Image from "next/image";
import { api } from "@/trpc/react";
import { useState } from "react";
import { Video as VideoIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button, IconButton, Chip, Stack } from "@mui/material";
import { Delete, Edit, Upload } from "@mui/icons-material";
import type { VideoListItem } from "@/lib/types";

type VideoCardProps = {
  video: VideoListItem;
  onDelete: () => void;
};

export function VideoCard({ video, onDelete }: VideoCardProps) {
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
    <Card className="hover:border-primary/50 overflow-hidden transition-colors">
      <CardHeader className="p-0">
        {/* Thumbnail */}
        <div className="bg-muted aspect-video w-full overflow-hidden">
          {video.thumbnailUrl ? (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <VideoIcon className="text-muted-foreground h-12 w-12" />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Title & Description */}
        <h3 className="mb-1 truncate text-lg font-semibold">{video.title}</h3>
        {video.description && (
          <p className="text-muted-foreground mb-2 line-clamp-2 text-sm">
            {video.description}
          </p>
        )}

        {/* Metadata */}
        <div className="text-muted-foreground mb-3 flex gap-2 text-xs">
          <span>{formatFileSize(video.fileSize)}</span>
          <span>•</span>
          <span>{formatDate(video.createdAt)}</span>
          <span>•</span>
          <span className="capitalize">{video.privacy.toLowerCase()}</span>
        </div>

        {/* Publish Status */}
        {video.publishJobs.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
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

      <CardFooter className="flex gap-2 p-4 pt-0">
        <Button
          variant="contained"
          startIcon={<Upload />}
          onClick={() => (window.location.href = `/publish/${video.id}`)}
          sx={{ flex: 1 }}
        >
          Publish
        </Button>
        <IconButton
          onClick={() => (window.location.href = `/video/${video.id}/edit`)}
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
      </CardFooter>
    </Card>
  );
}
