"use client";

/**
 * Video Library Page
 * Displays all user's uploaded videos with metadata and publish status
 *
 * Note: Loading and error states are handled automatically by Next.js
 * via loading.tsx and error.tsx in this directory
 */

import { api } from "@/trpc/react";
import type { VideoList } from "@/lib/types";
import { PostCard } from "@/app/_components/post-card";
import { CloudUpload as Upload, Movie as VideoIcon } from "@mui/icons-material";
import Link from "next/link";
import { Button, Container, Typography, Box, Stack, Grid } from "@mui/material";

/**
 * Type guard to ensure we have valid video data
 * This satisfies both TypeScript and ESLint's strict type checking
 */
function isValidVideoList(data: unknown): data is VideoList {
  return Array.isArray(data);
}

export function LibraryPage() {
  // Use Suspense query to leverage loading.tsx automatically
  const [videoList, queryUtils] = api.post.list.useSuspenseQuery();

  // Validate data shape - this is an actual error if it fails
  if (!isValidVideoList(videoList)) {
    throw new Error("Invalid video data format received from API");
  }

  return (
    <Container maxWidth={false} sx={{ py: 3 }}>
      <Header videoCount={videoList.length} />
      {videoList.length > 0 ? (
        <VideoGrid
          videos={videoList}
          onRefresh={() => void queryUtils.refetch()}
        />
      ) : (
        <EmptyState />
      )}
    </Container>
  );
}

/**
 * Header component with video count
 * Single Responsibility: Display page header and upload CTA
 */
function Header({ videoCount }: { videoCount: number }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
      spacing={2}
      sx={{ mb: 4 }}
    >
      <Box>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Video Library
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          {videoCount} video{videoCount !== 1 ? "s" : ""}
        </Typography>
      </Box>
      <Button
        component={Link}
        href="/upload"
        variant="contained"
        size="large"
        startIcon={<Upload />}
      >
        Upload Video
      </Button>
    </Stack>
  );
}

/**
 * Video grid component
 * Single Responsibility: Render grid of video cards
 */
function VideoGrid({
  videos,
  onRefresh,
}: {
  videos: VideoList;
  onRefresh: () => void;
}) {
  return (
    <Grid container spacing={3}>
      {videos.map((video) => (
        <Grid key={video.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <PostCard video={video} onDelete={onRefresh} />
        </Grid>
      ))}
    </Grid>
  );
}

/**
 * Empty state component
 * Single Responsibility: Display empty library state with CTA
 */
function EmptyState() {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={2}
      sx={{ py: 10, textAlign: "center" }}
    >
      <VideoIcon sx={{ fontSize: 80, color: "text.secondary", opacity: 0.5 }} />
      <Box>
        <Typography variant="h5" gutterBottom fontWeight="medium">
          No videos yet
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Upload your first video to get started
        </Typography>
        <Button
          component={Link}
          href="/upload"
          variant="contained"
          size="large"
          startIcon={<Upload />}
        >
          Upload Video
        </Button>
      </Box>
    </Stack>
  );
}
