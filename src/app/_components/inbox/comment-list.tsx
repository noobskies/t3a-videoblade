"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  Chip,
  IconButton,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  CheckCircle as CheckIcon,
  YouTube as YouTubeIcon,
  LinkedIn as LinkedInIcon,
  OpenInNew as OpenIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { Platform } from "../../../../generated/prisma";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function CommentList() {
  const [filter, setFilter] = useState<{
    isResolved: boolean;
    platform?: Platform;
  }>({
    isResolved: false,
  });

  const utils = api.useUtils();

  const { data, isLoading, isRefetching } = api.comment.list.useQuery(
    { isResolved: filter.isResolved, platform: filter.platform, limit: 50 },
    { refetchOnWindowFocus: false },
  );

  const resolveMutation = api.comment.resolve.useMutation({
    onSuccess: () => {
      void utils.comment.list.invalidate();
    },
  });

  const syncMutation = api.comment.sync.useMutation({
    onSuccess: () => {
      void utils.comment.list.invalidate();
    },
  });

  const handleResolve = (id: string, isResolved: boolean) => {
    resolveMutation.mutate({ id, isResolved });
  };

  const handleSync = () => {
    syncMutation.mutate();
  };

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case Platform.YOUTUBE:
        return <YouTubeIcon sx={{ color: "#FF0000" }} />;
      case Platform.LINKEDIN:
        return <LinkedInIcon sx={{ color: "#0077B5" }} />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5">Unified Inbox</Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant={!filter.isResolved ? "contained" : "outlined"}
            onClick={() => setFilter({ ...filter, isResolved: false })}
          >
            Open
          </Button>
          <Button
            variant={filter.isResolved ? "contained" : "outlined"}
            onClick={() => setFilter({ ...filter, isResolved: true })}
          >
            Resolved
          </Button>
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleSync}
            disabled={syncMutation.isPending}
          >
            {syncMutation.isPending ? "Syncing..." : "Sync"}
          </Button>
        </Stack>
      </Stack>

      {isLoading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2}>
          {data?.items.length === 0 && (
            <Box
              textAlign="center"
              p={4}
              bgcolor="background.paper"
              borderRadius={2}
            >
              <Typography color="text.secondary">No comments found.</Typography>
            </Box>
          )}

          {data?.items.map((comment) => (
            <Card key={comment.id} variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar src={comment.author.avatarUrl ?? undefined}>
                    {comment.author.name.charAt(0)}
                  </Avatar>

                  <Box flex={1}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2" fontWeight="bold">
                          {comment.author.name}
                        </Typography>
                        {getPlatformIcon(comment.platform)}
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(comment.publishedAt).fromNow()}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleResolve(comment.id, !comment.isResolved)
                          }
                          color={comment.isResolved ? "success" : "default"}
                        >
                          <CheckIcon />
                        </IconButton>
                      </Stack>
                    </Stack>

                    <Typography
                      variant="body1"
                      sx={{ whiteSpace: "pre-wrap" }}
                      mb={2}
                    >
                      {comment.content}
                    </Typography>

                    {comment.post && (
                      <Box
                        bgcolor="action.hover"
                        p={1.5}
                        borderRadius={1}
                        display="flex"
                        alignItems="center"
                        gap={2}
                      >
                        {comment.post.thumbnailUrl && (
                          <Box
                            component="img"
                            src={comment.post.thumbnailUrl}
                            sx={{
                              width: 40,
                              height: 40,
                              objectFit: "cover",
                              borderRadius: 1,
                            }}
                          />
                        )}
                        <Box flex={1}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            Comment on:
                          </Typography>
                          <Typography variant="body2" noWrap>
                            {comment.post.title ?? "Untitled Post"}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
