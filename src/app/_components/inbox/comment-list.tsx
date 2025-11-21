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
  IconButton,
  Button,
  CircularProgress,
  TextField,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import {
  CheckCircle as CheckIcon,
  YouTube as YouTubeIcon,
  LinkedIn as LinkedInIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { Platform } from "../../../../generated/prisma";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { ReplyInput } from "./reply-input";

dayjs.extend(relativeTime);

export function CommentList() {
  const [filter, setFilter] = useState<{
    isResolved: boolean;
    platform?: Platform;
    search: string;
  }>({
    isResolved: false,
    search: "",
  });

  const debouncedSearch = useDebounce(filter.search, 500);

  const utils = api.useUtils();

  const { data, isLoading } = api.comment.list.useQuery(
    {
      isResolved: filter.isResolved,
      platform: filter.platform,
      search: debouncedSearch,
      limit: 50,
    },
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
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
        mb={3}
      >
        <Typography variant="h5">Unified Inbox</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Search comments..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            select
            size="small"
            value={filter.platform ?? "ALL"}
            onChange={(e) =>
              setFilter({
                ...filter,
                platform:
                  e.target.value === "ALL"
                    ? undefined
                    : (e.target.value as Platform),
              })
            }
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="ALL">All Platforms</MenuItem>
            <MenuItem value={Platform.YOUTUBE}>YouTube</MenuItem>
            <MenuItem value={Platform.LINKEDIN}>LinkedIn</MenuItem>
            <MenuItem value={Platform.TIKTOK}>TikTok</MenuItem>
          </TextField>

          <Stack direction="row" spacing={1}>
            <Button
              variant={!filter.isResolved ? "contained" : "outlined"}
              onClick={() => setFilter({ ...filter, isResolved: false })}
              size="small"
            >
              Open
            </Button>
            <Button
              variant={filter.isResolved ? "contained" : "outlined"}
              onClick={() => setFilter({ ...filter, isResolved: true })}
              size="small"
            >
              Resolved
            </Button>
          </Stack>

          <IconButton
            onClick={handleSync}
            disabled={syncMutation.isPending}
            color="primary"
          >
            <RefreshIcon />
          </IconButton>
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

                    <ReplyInput commentId={comment.id} />
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
