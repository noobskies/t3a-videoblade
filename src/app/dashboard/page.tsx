"use client";

import React from "react";
import {
  Container,
  Grid,
  Typography,
  Stack,
  Box,
  Button,
  Paper,
  Card,
  CardContent,
  Chip,
  Alert,
} from "@mui/material";
import { api } from "@/trpc/react";
import { SummaryCards } from "@/app/_components/analytics/summary-cards";
import { TrendChart } from "@/app/_components/analytics/trend-chart";
import { PlatformBreakdown } from "@/app/_components/analytics/platform-breakdown";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckIcon from "@mui/icons-material/Check";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Link from "next/link";
import YouTubeIcon from "@mui/icons-material/YouTube";
import MusicNoteIcon from "@mui/icons-material/MusicNote"; // For TikTok
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo"; // For Vimeo
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setupMode = searchParams.get("setup") === "true";

  // Use Suspense Query for data fetching
  const [platforms, queryUtils] = api.platform.list.useSuspenseQuery();

  // Connection Mutations
  const connectYouTube = api.platform.connectYouTube.useMutation();
  const connectTikTok = api.platform.connectTikTok.useMutation();
  const connectVimeo = api.platform.connectVimeo.useMutation();

  // Analytics Data (only fetch if not in pure setup mode or if we have platforms)
  // We can safe-fetch; if no platforms, it returns 0s.
  const [stats] = api.analytics.getDashboardStats.useSuspenseQuery();
  const [trends] = api.analytics.getTrends.useSuspenseQuery();

  const utils = api.useUtils();

  const handleRefresh = () => {
    void utils.analytics.getDashboardStats.invalidate();
    void utils.analytics.getTrends.invalidate();
    void utils.platform.list.invalidate();
  };

  const handleConnectYouTube = async () => {
    try {
      await connectYouTube.mutateAsync();
      await queryUtils.refetch();
      // Force setup mode to keep user on this screen
      router.push("/dashboard?setup=true");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to connect YouTube";

      // If google account missing, we might need to link it (complex with better-auth, usually requires sign-in)
      // For MVP assume they signed in with Google or have it linked.
      alert(errorMessage);
    }
  };

  const handleConnectTikTok = async () => {
    try {
      await connectTikTok.mutateAsync();
      await queryUtils.refetch();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to connect TikTok";

      if (
        errorMessage.includes("not connected") ||
        errorMessage.includes("link your TikTok")
      ) {
        await authClient.signIn.social({
          provider: "tiktok",
          callbackURL: "/dashboard?setup=true", // Return to setup mode
        });
        return;
      }
      alert(errorMessage);
    }
  };

  const handleConnectVimeo = async () => {
    try {
      await connectVimeo.mutateAsync();
      await queryUtils.refetch();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to connect Vimeo";

      if (
        errorMessage.includes("not connected") ||
        errorMessage.includes("link your Vimeo")
      ) {
        await authClient.signIn.social({
          provider: "vimeo",
          callbackURL: "/dashboard?setup=true", // Return to setup mode
        });
        return;
      }
      alert(errorMessage);
    }
  };

  // Helper to check connection status
  const isConnected = (p: "YOUTUBE" | "TIKTOK" | "VIMEO") =>
    platforms.some((c) => c.platform === p);

  // --- SHOW SETUP/ONBOARDING IF: No platforms OR ?setup=true ---
  if (platforms.length === 0 || setupMode) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 4,
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            fontWeight="bold"
            gutterBottom
          >
            {platforms.length === 0
              ? "Welcome to VideoBlade"
              : "Connect Your Platforms"}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: 600, mx: "auto" }}
          >
            Connect your video platforms to unlock unified analytics,
            multi-platform publishing, and powerful automation tools.
          </Typography>

          <Grid container spacing={3} sx={{ mb: 6 }}>
            {/* YouTube Card */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                variant="outlined"
                sx={{ height: "100%", position: "relative" }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                    pt: 4,
                  }}
                >
                  <YouTubeIcon sx={{ fontSize: 56, color: "#FF0000" }} />
                  <Typography variant="h6">YouTube</Typography>
                  {isConnected("YOUTUBE") ? (
                    <Chip
                      icon={<CheckIcon />}
                      label="Connected"
                      color="success"
                      variant="filled"
                    />
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleConnectYouTube}
                      disabled={connectYouTube.isPending}
                    >
                      {connectYouTube.isPending ? "Connecting..." : "Connect"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* TikTok Card */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                variant="outlined"
                sx={{ height: "100%", position: "relative" }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                    pt: 4,
                  }}
                >
                  <MusicNoteIcon
                    sx={{
                      fontSize: 56,
                      color: (theme) =>
                        theme.palette.mode === "dark" ? "#fff" : "#000",
                    }}
                  />
                  <Typography variant="h6">TikTok</Typography>
                  {isConnected("TIKTOK") ? (
                    <Chip
                      icon={<CheckIcon />}
                      label="Connected"
                      color="success"
                      variant="filled"
                    />
                  ) : (
                    <Button
                      variant="contained"
                      color="inherit"
                      onClick={handleConnectTikTok}
                      disabled={connectTikTok.isPending}
                    >
                      {connectTikTok.isPending ? "Connecting..." : "Connect"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Vimeo Card */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                variant="outlined"
                sx={{ height: "100%", position: "relative" }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                    pt: 4,
                  }}
                >
                  <OndemandVideoIcon sx={{ fontSize: 56, color: "#1AB7EA" }} />
                  <Typography variant="h6">Vimeo</Typography>
                  {isConnected("VIMEO") ? (
                    <Chip
                      icon={<CheckIcon />}
                      label="Connected"
                      color="success"
                      variant="filled"
                    />
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
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Button
            component={Link}
            href="/dashboard" // Clicking this clears the query param effectively by navigating to clean route
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            disabled={platforms.length === 0} // Encourage at least one connection
            sx={{
              px: 6,
              py: 1.5,
              fontSize: "1.1rem",
              borderRadius: 2,
            }}
          >
            Continue to Dashboard
          </Button>

          {platforms.length === 0 && (
            <Typography
              variant="caption"
              display="block"
              sx={{ mt: 2, color: "text.secondary" }}
            >
              Connect at least one platform to continue
            </Typography>
          )}
        </Paper>
      </Container>
    );
  }

  // --- SCENARIO: DASHBOARD VIEW ---
  return (
    <Container maxWidth={false} sx={{ py: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Analytics Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Performance overview across all platforms
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            component={Link}
            href="/dashboard?setup=true"
            variant="outlined"
            color="secondary"
          >
            Manage Connections
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Refresh Data
          </Button>
        </Stack>
      </Stack>

      <Box sx={{ mb: 4 }}>
        <SummaryCards stats={stats} />
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8, lg: 9 }}>
          <TrendChart data={trends} connectedPlatforms={platforms} />
        </Grid>
        <Grid size={{ xs: 12, md: 4, lg: 3 }}>
          <PlatformBreakdown
            platformBreakdown={stats.platformBreakdown}
            connectedPlatforms={platforms}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
