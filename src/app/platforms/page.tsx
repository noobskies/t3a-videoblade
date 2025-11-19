"use client";

import type { PlatformConnectionList } from "@/lib/types";
import { api } from "@/trpc/react";
import {
  Check as CheckIcon,
  YouTube as YouTubeIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  Typography,
} from "@mui/material";

/**
 * Type guard to ensure we have valid platform connection data
 * This satisfies both TypeScript and ESLint's strict type checking
 */
function isValidPlatformList(data: unknown): data is PlatformConnectionList {
  return Array.isArray(data);
}

export default function PlatformsPage() {
  const query = api.platform.list.useQuery();
  const connectYouTube = api.platform.connectYouTube.useMutation();
  const disconnect = api.platform.disconnect.useMutation();

  const handleConnectYouTube = async () => {
    try {
      await connectYouTube.mutateAsync();
      await query.refetch();
      alert("YouTube connected successfully!");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to connect YouTube";
      alert(errorMessage);
    }
  };

  const handleDisconnect = async (id: string) => {
    if (
      !confirm(
        "Disconnect YouTube? You won't be able to publish until you reconnect.",
      )
    )
      return;

    try {
      await disconnect.mutateAsync({ id });
      await query.refetch();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to disconnect";
      alert(errorMessage);
    }
  };

  // Handle loading state
  if (query.isLoading || !query.data) {
    return null;
  }

  // Handle error state - Next.js error.tsx will catch this
  if (query.error) {
    throw new Error(query.error.message);
  }

  // Validate data shape - this is an actual error if it fails
  if (!isValidPlatformList(query.data)) {
    throw new Error(
      "Invalid platform connection data format received from API",
    );
  }

  const connections: PlatformConnectionList = query.data;
  const youtubeConnection = connections.find((c) => c.platform === "YOUTUBE");

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Platform Connections
      </Typography>

      <Stack spacing={4}>
        {/* YouTube Card */}
        <Card>
          <CardContent>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={2}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <YouTubeIcon sx={{ fontSize: 40, color: "error.main" }} />
                <Box>
                  <Typography variant="h6">YouTube</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upload and publish videos to your channel
                  </Typography>
                </Box>
              </Stack>

              {youtubeConnection ? (
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip
                    icon={<CheckIcon />}
                    label="Connected"
                    color="success"
                    variant="outlined"
                  />
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDisconnect(youtubeConnection.id)}
                    disabled={disconnect.isPending}
                  >
                    {disconnect.isPending ? "Disconnecting..." : "Disconnect"}
                  </Button>
                </Stack>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleConnectYouTube}
                  disabled={connectYouTube.isPending}
                >
                  {connectYouTube.isPending ? "Connecting..." : "Connect"}
                </Button>
              )}
            </Stack>

            {youtubeConnection && (
              <Box mt={2} pt={2} borderTop={1} borderColor="divider">
                <Typography variant="body2" color="text.secondary">
                  Channel: {youtubeConnection.platformUsername}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Connected:{" "}
                  {new Date(youtubeConnection.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Info Box */}
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Note:</strong> You must sign in with Google to connect
            YouTube. Make sure you&apos;ve granted YouTube permissions during
            sign-in.
          </Typography>
        </Alert>
      </Stack>
    </Container>
  );
}
