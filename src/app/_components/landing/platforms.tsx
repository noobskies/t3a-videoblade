import { Box, Container, Stack, Typography } from "@mui/material";
import { YouTube, MusicNote } from "@mui/icons-material";

export function Platforms() {
  return (
    <Box
      sx={{
        py: 8,
        borderTop: 1,
        borderColor: "divider",
        borderBottom: 1,
        bgcolor: "background.default", // ensure it matches main background
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="body1"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 4, textTransform: "uppercase", letterSpacing: 2 }}
        >
          Supported Platforms
        </Typography>
        <Stack
          direction="row"
          spacing={{ xs: 4, md: 8 }}
          justifyContent="center"
          flexWrap="wrap"
          useFlexGap
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ opacity: 0.8 }}
          >
            <YouTube sx={{ fontSize: 40, color: "#ff0000" }} />
            <Typography variant="h5" fontWeight="bold">
              YouTube
            </Typography>
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ opacity: 0.8 }}
          >
            <MusicNote sx={{ fontSize: 40, color: "#00f2ea" }} />
            <Typography variant="h5" fontWeight="bold">
              TikTok
            </Typography>
          </Stack>
          {/* Add placeholders for future platforms if needed, or keep it clean */}
        </Stack>
      </Container>
    </Box>
  );
}
