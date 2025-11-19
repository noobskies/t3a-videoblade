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
import { VideoCard } from "@/app/_components/video-card";
import { Upload as UploadIcon, Video as VideoIcon } from "lucide-react";
import Link from "next/link";
import { Button, Box, Container, Stack, Typography } from "@mui/material";

/**
 * Type guard to ensure we have valid video data
 * This satisfies both TypeScript and ESLint's strict type checking
 */
function isValidVideoList(data: unknown): data is VideoList {
  return Array.isArray(data);
}

export default function LibraryPage() {
  const query = api.video.list.useQuery();

  // Handle loading state - Next.js loading.tsx will display
  if (query.isLoading || !query.data) {
    return null;
  }

  // Handle error state - Next.js error.tsx will catch this
  if (query.error) {
    throw new Error(query.error.message);
  }

  // Validate data shape - this is an actual error if it fails
  if (!isValidVideoList(query.data)) {
    throw new Error("Invalid video data format received from API");
  }

  const videoList: VideoList = query.data;

  return (
    <Container maxWidth="xl" component="main" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Header videoCount={videoList.length} />
        {videoList.length > 0 ? (
          <VideoGrid
            videos={videoList}
            onRefresh={() => void query.refetch()}
          />
        ) : (
          <EmptyState />
        )}
      </Stack>
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
    >
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Video Library
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {videoCount} video{videoCount !== 1 ? "s" : ""}
        </Typography>
      </Box>
      <Button
        component={Link}
        href="/upload"
        variant="contained"
        startIcon={<UploadIcon className="h-5 w-5" />}
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
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(1, 1fr)",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)",
        },
        gap: 3,
      }}
    >
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} onDelete={onRefresh} />
      ))}
    </Box>
  );
}

/**
 * Empty state component
 * Single Responsibility: Display empty library state with CTA
 */
function EmptyState() {
  return (
    <Stack
      spacing={3}
      alignItems="center"
      justifyContent="center"
      sx={{ py: 10, textAlign: "center" }}
    >
      <VideoIcon className="h-20 w-20" style={{ opacity: 0.3 }} />
      <Box>
        <Typography variant="h5" gutterBottom color="text.secondary">
          No videos yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload your first video to get started
        </Typography>
      </Box>
      <Button
        component={Link}
        href="/upload"
        variant="contained"
        size="large"
        startIcon={<UploadIcon className="h-5 w-5" />}
      >
        Upload Video
      </Button>
    </Stack>
  );
}
