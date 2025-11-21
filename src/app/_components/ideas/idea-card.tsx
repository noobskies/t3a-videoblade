"use client";

import { api } from "@/trpc/react";
import { useState } from "react";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  RocketLaunch as PromoteIcon,
} from "@mui/icons-material";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import type { PostListItem } from "@/lib/types";

type IdeaCardProps = {
  idea: PostListItem;
  onDelete: () => void;
};

export function IdeaCard({ idea, onDelete }: IdeaCardProps) {
  const deletePost = api.post.delete.useMutation();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this idea?")) return;

    try {
      await deletePost.mutateAsync({ id: idea.id });
      onDelete();
    } catch (error) {
      console.error("Failed to delete idea:", error);
      alert("Failed to delete idea");
    }
  };

  // Display title or first 50 chars of content
  const displayTitle =
    idea.title ||
    (idea.content
      ? idea.content.slice(0, 50) + (idea.content.length > 50 ? "..." : "")
      : "Untitled Idea");

  // Display remaining content if title exists
  const displayContent =
    idea.title && idea.content
      ? idea.content
      : idea.content && idea.content.length > 50
        ? "..." + idea.content.slice(50)
        : "";

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom>
          {displayTitle}
        </Typography>

        {displayContent && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ whiteSpace: "pre-wrap" }}
          >
            {displayContent}
          </Typography>
        )}

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 2, display: "block" }}
        >
          {new Date(idea.createdAt).toLocaleDateString()}
        </Typography>
      </CardContent>

      <CardActions>
        <Tooltip title="Convert to Post">
          <Button
            size="small"
            startIcon={<PromoteIcon />}
            href={`/post/${idea.id}/edit`}
            sx={{ mr: "auto" }}
          >
            Create Post
          </Button>
        </Tooltip>

        <Tooltip title="Edit">
          <IconButton size="small" href={`/post/${idea.id}/edit`}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Delete">
          <IconButton size="small" color="error" onClick={handleDelete}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}
