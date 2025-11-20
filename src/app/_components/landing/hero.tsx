import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { AuthButton } from "@/app/_components/auth-button";
import { ArrowForward as ArrowForwardIcon } from "@mui/icons-material";
import Link from "next/link";

export function Hero() {
  return (
    <Box
      sx={{
        pt: { xs: 12, md: 24 },
        pb: { xs: 8, md: 16 },
        background:
          "radial-gradient(circle at 50% 20%, rgba(144, 202, 249, 0.15) 0%, rgba(18, 18, 18, 0) 50%)",
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={5} alignItems="center" textAlign="center">
          <Stack spacing={2}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "3rem", sm: "4rem", md: "5rem" },
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                background: "linear-gradient(135deg, #ffffff 0%, #90caf9 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Publish Everywhere.
            </Typography>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "3rem", sm: "4rem", md: "5rem" },
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                background: "linear-gradient(45deg, #90caf9 30%, #ce93d8 90%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Instantly.
            </Typography>
          </Stack>

          <Typography
            variant="h5"
            color="text.secondary"
            sx={{
              maxWidth: "800px",
              lineHeight: 1.6,
              fontSize: { xs: "1.1rem", md: "1.4rem" },
              fontWeight: 400,
            }}
          >
            Stop uploading the same video 5 times. Upload once to VideoBlade and
            distribute to YouTube, TikTok, and more in seconds.
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ pt: 2 }}
          >
            <AuthButton />
            <Button
              variant="outlined"
              size="large"
              endIcon={<ArrowForwardIcon />}
              component={Link}
              href="#features"
              sx={{ borderRadius: 20, px: 4 }}
            >
              Learn More
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
