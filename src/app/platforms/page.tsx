"use client";

import { api } from "@/trpc/react";
import type { PlatformConnectionList } from "@/lib/types";
import { Youtube, Check } from "lucide-react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Box,
  Button,
  Chip,
  Alert,
  Divider,
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
    <Container maxWidth="md" component="main" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Typography variant="h4" component="h1">
          Platform Connections
        </Typography>

        {/* YouTube Card */}
        <Card>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Youtube className="h-10 w-10 text-red-500" />
                <Box>
                  <Typography variant="h6" component="h2">
                    YouTube
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upload and publish videos to your channel
                  </Typography>
                </Box>
              </Stack>

              {youtubeConnection ? (
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip
                    icon={<Check className="h-4 w-4" />}
                    label="Connected"
                    color="success"
                    size="small"
                  />
                  <Button
                    onClick={() => handleDisconnect(youtubeConnection.id)}
                    disabled={disconnect.isPending}
                    variant="outlined"
                    color="error"
                    size="small"
                  >
                    {disconnect.isPending ? "Disconnecting..." : "Disconnect"}
                  </Button>
                </Stack>
              ) : (
                <Button
                  onClick={handleConnectYouTube}
                  disabled={connectYouTube.isPending}
                  variant="contained"
                >
                  {connectYouTube.isPending ? "Connecting..." : "Connect"}
                </Button>
              )}
            </Stack>

            {youtubeConnection && (
              <>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Channel:</strong>{" "}
                    {youtubeConnection.platformUsername}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Connected:</strong>{" "}
                    {new Date(youtubeConnection.createdAt).toLocaleDateString()}
                  </Typography>
                </Stack>
              </>
            )}
          </CardContent>
        </Card>

        {/* Info Box */}
        <Alert severity="info">
          <strong>Note:</strong> You must sign in with Google to connect
          YouTube. Make sure you&apos;ve granted YouTube permissions during
          sign-in.
        </Alert>
      </Stack>
    </Container>
  );
}
