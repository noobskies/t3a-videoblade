import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/server/auth";
import { api } from "@/trpc/server";
import {
  Container,
  Stack,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import { Upload, Video, Youtube, CheckCircle } from "lucide-react";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Get user stats if authenticated
  let videoCount = 0;
  let platformCount = 0;

  if (session?.user) {
    try {
      const videos = await api.video.list();
      const platforms = await api.platform.list();
      videoCount = videos.length;
      platformCount = platforms.length;
    } catch (error) {
      console.error("Failed to load user stats:", error);
    }
  }

  return (
    <Container maxWidth="md" component="main" sx={{ py: 8 }}>
      <Stack spacing={6} alignItems="center">
        {/* Hero Section */}
        <Stack spacing={2} alignItems="center" textAlign="center">
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Video className="h-12 w-12" />
            <Typography
              variant="h2"
              component="h1"
              fontWeight="bold"
              sx={{
                background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              VideoBlade
            </Typography>
          </Box>

          <Typography variant="h5" color="text.secondary" gutterBottom>
            Upload once, publish everywhere
          </Typography>

          <Typography variant="body1" color="text.secondary" maxWidth="sm">
            Streamline your video publishing workflow. Upload your video to
            VideoBlade and distribute it to multiple platforms simultaneously.
          </Typography>
        </Stack>

        {/* Authenticated User Section */}
        {session?.user ? (
          <Stack spacing={3} alignItems="center" sx={{ width: "100%" }}>
            <Typography variant="h6" color="text.secondary">
              Welcome back, {session.user.name}!
            </Typography>

            {/* Quick Stats */}
            <Stack direction="row" spacing={3}>
              <Chip
                label={`${videoCount} ${videoCount === 1 ? "Video" : "Videos"}`}
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`${platformCount} ${platformCount === 1 ? "Platform" : "Platforms"} Connected`}
                color="success"
                variant="outlined"
              />
            </Stack>

            {/* Quick Actions */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ width: "100%", maxWidth: "sm" }}
            >
              <Button
                component={Link}
                href="/library"
                variant="contained"
                size="large"
                fullWidth
                startIcon={<Video className="h-5 w-5" />}
              >
                My Library
              </Button>
              <Button
                component={Link}
                href="/upload"
                variant="contained"
                size="large"
                fullWidth
                startIcon={<Upload className="h-5 w-5" />}
              >
                Upload Video
              </Button>
            </Stack>

            <Button
              component={Link}
              href="/platforms"
              variant="outlined"
              size="medium"
            >
              Manage Platforms
            </Button>
          </Stack>
        ) : (
          /* Unauthenticated User Section */
          <Stack spacing={4} alignItems="center" sx={{ width: "100%" }}>
            {/* Features */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                gap: 3,
                width: "100%",
                mt: 2,
              }}
            >
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={2} alignItems="center" textAlign="center">
                    <Youtube className="h-10 w-10 text-red-500" />
                    <Typography variant="h6">Multi-Platform</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Publish to YouTube, Rumble, and more platforms from one
                      place
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={2} alignItems="center" textAlign="center">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                    <Typography variant="h6">Save Time</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Upload once and let VideoBlade handle distribution to all
                      your platforms
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Box>

            {/* CTA */}
            <Button
              component={Link}
              href="/api/auth/signin/google"
              variant="contained"
              size="large"
              sx={{ mt: 4 }}
            >
              Sign in with Google to Get Started
            </Button>

            <Typography variant="caption" color="text.secondary">
              Connect your video platforms and start publishing in minutes
            </Typography>
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
