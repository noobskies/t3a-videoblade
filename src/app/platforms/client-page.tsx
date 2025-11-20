"use client";

import type { PlatformConnectionList } from "@/lib/types";
import { api } from "@/trpc/react";
import { authClient } from "@/lib/auth-client";
import {
  Check as CheckIcon,
  YouTube as YouTubeIcon,
  MusicNote as TikTokIcon,
  OndemandVideo as VimeoIcon,
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
import Link from "next/link";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

/**
 * Type guard to ensure we have valid platform connection data
 * This satisfies both TypeScript and ESLint's strict type checking
 */
function isValidPlatformList(data: unknown): data is PlatformConnectionList {
  return Array.isArray(data);
}

export function PlatformsPage() {
  // Use Suspense query to leverage loading.tsx automatically
  const [connections, queryUtils] = api.platform.list.useSuspenseQuery();
  const connectYouTube = api.platform.connectYouTube.useMutation();
  const connectTikTok = api.platform.connectTikTok.useMutation();
  const connectVimeo = api.platform.connectVimeo.useMutation();
  const disconnect = api.platform.disconnect.useMutation();

  const handleConnectYouTube = async () => {
    try {
      await connectYouTube.mutateAsync();
      await queryUtils.refetch();
      alert("YouTube connected successfully!");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to connect YouTube";
      alert(errorMessage);
    }
  };

  const handleConnectTikTok = async () => {
    try {
      // Try to connect using existing link first
      await connectTikTok.mutateAsync();
      await queryUtils.refetch();
      alert("TikTok connected successfully!");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to connect TikTok";

      // If account not found, redirect to link it
      if (
        errorMessage.includes("not connected") ||
        errorMessage.includes("link your TikTok")
      ) {
        await authClient.signIn.social({
          provider: "tiktok",
          callbackURL: "/platforms", // User will need to click Connect again after return
        });
        return;
      }

      alert(errorMessage);
    }
  };

  const handleConnectVimeo = async () => {
    try {
      // Try to connect using existing link first
      await connectVimeo.mutateAsync();
      await queryUtils.refetch();
      alert("Vimeo connected successfully!");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to connect Vimeo";

      // If account not found, redirect to link it
      if (
        errorMessage.includes("not connected") ||
        errorMessage.includes("link your Vimeo")
      ) {
        await authClient.signIn.social({
          provider: "vimeo",
          callbackURL: "/platforms",
        });
        return;
      }

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
      await queryUtils.refetch();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to disconnect";
      alert(errorMessage);
    }
  };

  // Validate data shape - this is an actual error if it fails
  if (!isValidPlatformList(connections)) {
    throw new Error(
      "Invalid platform connection data format received from API",
    );
  }

  const youtubeConnection = connections.find((c) => c.platform === "YOUTUBE");
  const tiktokConnection = connections.find((c) => c.platform === "TIKTOK");
  const vimeoConnection = connections.find((c) => c.platform === "VIMEO");

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
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
                    startIcon={<CalendarMonthIcon />}
                    component={Link}
                    href={`/platforms/${youtubeConnection.id}/schedule`}
                  >
                    Schedule Settings
                  </Button>
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

        {/* TikTok Card */}
        <Card>
          <CardContent>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={2}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <TikTokIcon sx={{ fontSize: 40, color: "secondary.main" }} />
                <Box>
                  <Typography variant="h6">TikTok</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upload and publish short-form videos
                  </Typography>
                </Box>
              </Stack>

              {tiktokConnection ? (
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip
                    icon={<CheckIcon />}
                    label="Connected"
                    color="success"
                    variant="outlined"
                  />
                  <Button
                    variant="outlined"
                    startIcon={<CalendarMonthIcon />}
                    component={Link}
                    href={`/platforms/${tiktokConnection.id}/schedule`}
                  >
                    Schedule Settings
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDisconnect(tiktokConnection.id)}
                    disabled={disconnect.isPending}
                  >
                    {disconnect.isPending ? "Disconnecting..." : "Disconnect"}
                  </Button>
                </Stack>
              ) : (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleConnectTikTok}
                  disabled={connectTikTok.isPending}
                >
                  {connectTikTok.isPending ? "Connecting..." : "Connect"}
                </Button>
              )}
            </Stack>

            {tiktokConnection && (
              <Box mt={2} pt={2} borderTop={1} borderColor="divider">
                <Typography variant="body2" color="text.secondary">
                  User: {tiktokConnection.platformUsername}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Connected:{" "}
                  {new Date(tiktokConnection.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Vimeo Card */}
        <Card>
          <CardContent>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={2}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <VimeoIcon sx={{ fontSize: 40, color: "info.main" }} />
                <Box>
                  <Typography variant="h6">Vimeo</Typography>
                  <Typography variant="body2" color="text.secondary">
                    High-quality video hosting and distribution
                  </Typography>
                </Box>
              </Stack>

              {vimeoConnection ? (
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip
                    icon={<CheckIcon />}
                    label="Connected"
                    color="success"
                    variant="outlined"
                  />
                  <Button
                    variant="outlined"
                    startIcon={<CalendarMonthIcon />}
                    component={Link}
                    href={`/platforms/${vimeoConnection.id}/schedule`}
                  >
                    Schedule Settings
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDisconnect(vimeoConnection.id)}
                    disabled={disconnect.isPending}
                  >
                    {disconnect.isPending ? "Disconnecting..." : "Disconnect"}
                  </Button>
                </Stack>
              ) : (
                <Button
                  variant="contained"
                  color="info"
                  onClick={handleConnectVimeo}
                  disabled={connectVimeo.isPending}
                >
                  {connectVimeo.isPending ? "Connecting..." : "Connect"}
                </Button>
              )}
            </Stack>

            {vimeoConnection && (
              <Box mt={2} pt={2} borderTop={1} borderColor="divider">
                <Typography variant="body2" color="text.secondary">
                  User: {vimeoConnection.platformUsername}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Connected:{" "}
                  {new Date(vimeoConnection.createdAt).toLocaleDateString()}
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
