"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import {
  Box,
  Button,
  TextField,
  Stack,
  Typography,
  Alert,
} from "@mui/material";
import { Send as SendIcon, Cancel as CancelIcon } from "@mui/icons-material";

interface ReplyInputProps {
  commentId: string;
  onSuccess?: () => void;
}

export function ReplyInput({ commentId, onSuccess }: ReplyInputProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const utils = api.useUtils();

  const replyMutation = api.comment.reply.useMutation({
    onSuccess: () => {
      setContent("");
      setIsExpanded(false);
      setError(null);
      void utils.comment.list.invalidate();
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = () => {
    if (!content.trim()) return;
    replyMutation.mutate({ commentId, content });
  };

  if (!isExpanded) {
    return (
      <Button variant="text" size="small" onClick={() => setIsExpanded(true)}>
        Reply
      </Button>
    );
  }

  return (
    <Box mt={2}>
      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}
      <TextField
        fullWidth
        multiline
        rows={3}
        placeholder="Write a reply..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={replyMutation.isPending}
        sx={{ mb: 1 }}
      />
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button
          startIcon={<CancelIcon />}
          onClick={() => {
            setIsExpanded(false);
            setContent("");
            setError(null);
          }}
          disabled={replyMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={handleSubmit}
          disabled={!content.trim() || replyMutation.isPending}
        >
          {replyMutation.isPending ? "Sending..." : "Send Reply"}
        </Button>
      </Stack>
    </Box>
  );
}
