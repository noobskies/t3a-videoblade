/**
 * Loading state for the library route
 * Automatically displayed by Next.js while page.tsx is loading
 * Can be a server component (no "use client" needed)
 */
import { CircularProgress, Box, Typography, Stack } from "@mui/material";

export default function Loading() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Stack alignItems="center" spacing={2}>
        <CircularProgress size={48} />
        <Typography variant="body1" color="text.secondary">
          Loading videos...
        </Typography>
      </Stack>
    </Box>
  );
}
