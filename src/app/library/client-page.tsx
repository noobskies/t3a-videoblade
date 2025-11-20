"use client";

/**
 * Video Library Page
 * Displays all user's uploaded videos with metadata and publish status
 *
 * Note: Loading and error states are handled automatically by Next.js
 * via loading.tsx and error.tsx in this directory
 */

import { api } from "@/trpc/react";
import type { PostList } from "@/lib/types";
import { PostCard } from "@/app/_components/post-card";
import {
  CloudUpload as Upload,
  PermMedia as MediaIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { Button, Container, Typography, Box, Stack, Grid } from "@mui/material";

/**
 * Type guard to ensure we have valid post data
 * This satisfies both TypeScript and ESLint's strict type checking
 */
function isValidPostList(data: unknown): data is PostList {
  return Array.isArray(data);
}

export function LibraryPage() {
  // Use Suspense query to leverage loading.tsx automatically
  const [postList, queryUtils] = api.post.list.useSuspenseQuery();

  // Validate data shape - this is an actual error if it fails
  if (!isValidPostList(postList)) {
    throw new Error("Invalid post data format received from API");
  }

  return (
    <Container maxWidth={false} sx={{ py: 3 }}>
      <Header postCount={postList.length} />
      {postList.length > 0 ? (
        <PostGrid
          posts={postList}
          onRefresh={() => void queryUtils.refetch()}
        />
      ) : (
        <EmptyState />
      )}
    </Container>
  );
}

/**
 * Header component with post count
 * Single Responsibility: Display page header and upload CTA
 */
function Header({ postCount }: { postCount: number }) {
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
          Media Library
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          {postCount} post{postCount !== 1 ? "s" : ""}
        </Typography>
      </Box>
      <Button
        component={Link}
        href="/upload"
        variant="contained"
        size="large"
        startIcon={<Upload />}
      >
        Upload Media
      </Button>
    </Stack>
  );
}

/**
 * Post grid component
 * Single Responsibility: Render grid of post cards
 */
function PostGrid({
  posts,
  onRefresh,
}: {
  posts: PostList;
  onRefresh: () => void;
}) {
  return (
    <Grid container spacing={3}>
      {posts.map((post) => (
        <Grid key={post.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <PostCard post={post} onDelete={onRefresh} />
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
      <MediaIcon sx={{ fontSize: 80, color: "text.secondary", opacity: 0.5 }} />
      <Box>
        <Typography variant="h5" gutterBottom fontWeight="medium">
          No posts yet
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Upload your first media to get started
        </Typography>
        <Button
          component={Link}
          href="/upload"
          variant="contained"
          size="large"
          startIcon={<Upload />}
        >
          Upload Media
        </Button>
      </Box>
    </Stack>
  );
}
