import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
import { AuthButton } from "@/app/_components/auth-button";
import {
  Container,
  Typography,
  Box,
  Stack,
  Button,
  Paper,
} from "@mui/material";
import {
  VideoLibrary as LibraryIcon,
  CloudUpload as UploadIcon,
  Settings as SettingsIcon,
  YouTube as YouTubeIcon,
  MusicNote as TikTokIcon,
} from "@mui/icons-material";
import { Chip } from "@mui/material";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <HydrateClient>
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(to bottom, #1e1e1e, #121212)",
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={4} alignItems="center" textAlign="center">
            {/* Branding */}
            <Box>
              <Typography
                variant="h2"
                component="h1"
                fontWeight="bold"
                gutterBottom
                sx={{
                  background: "linear-gradient(45deg, #90caf9 30%, #ce93d8 90%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                VideoBlade
              </Typography>
              <Typography variant="h5" color="text.secondary" gutterBottom>
                Multi-Platform Video Publishing
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                Upload once, publish everywhere. Manage your video content across
                YouTube, TikTok, and more from a single dashboard.
              </Typography>

              <Stack
                direction="row"
                spacing={2}
                justifyContent="center"
                sx={{ mt: 3 }}
              >
                <Chip
                  icon={<YouTubeIcon sx={{ color: "#ff0000 !important" }} />}
                  label="YouTube"
                  variant="outlined"
                />
                <Chip
                  icon={<TikTokIcon sx={{ color: "#00f2ea !important" }} />}
                  label="TikTok"
                  variant="outlined"
                />
              </Stack>
            </Box>

            {/* Actions */}
            <Paper
              elevation={3}
              sx={{
                p: 4,
                width: "100%",
                maxWidth: 600,
                borderRadius: 2,
                bgcolor: "background.paper",
              }}
            >
              {session?.user ? (
                <Stack spacing={3}>
                  <Typography variant="h6">
                    Welcome back, {session.user.name}
                  </Typography>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    justifyContent="center"
                  >
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<LibraryIcon />}
                      component={Link}
                      href="/library"
                    >
                      Video Library
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<UploadIcon />}
                      component={Link}
                      href="/upload"
                    >
                      Upload New
                    </Button>
                  </Stack>

                  <Button
                    variant="text"
                    startIcon={<SettingsIcon />}
                    component={Link}
                    href="/platforms"
                    sx={{ alignSelf: "center" }}
                  >
                    Manage Platforms
                  </Button>
                </Stack>
              ) : (
                <Stack spacing={3} alignItems="center">
                  <Typography variant="h6">
                    Sign in to manage your videos
                  </Typography>
                  <AuthButton />
                </Stack>
              )}
            </Paper>
          </Stack>
        </Container>
      </Box>
    </HydrateClient>
  );
}
