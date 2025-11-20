import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
import { AuthButton } from "@/app/_components/auth-button";
import { LandingPage } from "@/app/_components/landing/landing-page";
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
} from "@mui/icons-material";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Unauthenticated: Show Landing Page
  if (!session?.user) {
    return <LandingPage />;
  }

  // Authenticated: Show Dashboard
  return (
    <HydrateClient>
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          // Keep the dashboard simple/clean
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={4} alignItems="center" textAlign="center">
            {/* Dashboard Header */}
            <Box>
              <Typography
                variant="h3"
                component="h1"
                fontWeight="bold"
                gutterBottom
                sx={{
                  background:
                    "linear-gradient(45deg, #90caf9 30%, #ce93d8 90%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                VideoBlade
              </Typography>
              <Typography variant="h5" color="text.secondary">
                Dashboard
              </Typography>
            </Box>

            {/* Dashboard Actions */}
            <Paper
              elevation={0}
              variant="outlined"
              sx={{
                p: 6,
                width: "100%",
                maxWidth: 600,
                borderRadius: 4,
                bgcolor: "background.paper",
              }}
            >
              <Stack spacing={4}>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  justifyContent="center"
                >
                  {/* Avatar could go here if we wanted, but it's in the app bar now */}
                  <Typography variant="h5">
                    Welcome back, {session.user.name}
                  </Typography>
                </Stack>

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
                    fullWidth
                  >
                    Video Library
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<UploadIcon />}
                    component={Link}
                    href="/upload"
                    fullWidth
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
            </Paper>
          </Stack>
        </Container>
      </Box>
    </HydrateClient>
  );
}
