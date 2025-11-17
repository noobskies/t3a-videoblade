"use client";

import Image from "next/image";
import { api } from "@/trpc/react";
import { useState } from "react";
import { Video as VideoIcon, Trash2, Edit, Upload } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "default"; // green
      case "PROCESSING":
        return "secondary"; // blue
      case "FAILED":
        return "destructive"; // red
      case "PENDING":
        return "outline"; // yellow/neutral
      default:
        return "outline";
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
          <div className="mb-3 flex flex-wrap gap-2">
            {video.publishJobs.map((job) => (
              <Badge key={job.platform} variant={getStatusVariant(job.status)}>
                {job.platform}: {job.status}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 p-4 pt-0">
        <Button
          className="flex-1"
          onClick={() => (window.location.href = `/publish/${video.id}`)}
        >
          <Upload className="mr-2 h-4 w-4" />
          Publish
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => (window.location.href = `/video/${video.id}/edit`)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
