"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import {
  Paper,
  TextField,
  Button,
  Box,
  Collapse,
  Typography,
  Stack,
} from "@mui/material";
import { Add as AddIcon, Close as CloseIcon } from "@mui/icons-material";

type QuickEntryProps = {
  onSuccess: () => void;
};

export function QuickEntry({ onSuccess }: QuickEntryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState("");
  const createPost = api.post.create.useMutation();

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      await createPost.mutateAsync({
        type: "TEXT",
        isIdea: true,
        content: content.trim(),
        privacy: "UNLISTED",
      });
      setContent("");
      setIsExpanded(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to create idea:", error);
      alert("Failed to create idea");
    }
  };

  const handleCancel = () => {
    setContent("");
    setIsExpanded(false);
  };

  return (
    <Paper
      elevation={isExpanded ? 3 : 1}
      sx={{
        p: 2,
        mb: 4,
        cursor: !isExpanded ? "text" : "default",
        transition: "all 0.2s",
        border: "1px solid",
        borderColor: "divider",
      }}
      onClick={() => !isExpanded && setIsExpanded(true)}
    >
      {!isExpanded ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            color: "text.secondary",
          }}
        >
          <AddIcon sx={{ mr: 1 }} />
          <Typography>Jot down a new idea...</Typography>
        </Box>
      ) : (
        <Box>
          <TextField
            fullWidth
            multiline
            minRows={3}
            placeholder="What's on your mind?"
            variant="standard"
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{ disableUnderline: true }}
          />
          <Collapse in={isExpanded}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant="text"
                color="inherit"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel();
                }}
                startIcon={<CloseIcon />}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSubmit();
                }}
                disabled={createPost.isPending || !content.trim()}
              >
                {createPost.isPending ? "Saving..." : "Save Idea"}
              </Button>
            </Stack>
          </Collapse>
        </Box>
      )}
    </Paper>
  );
}
