/**
 * Reusable loading skeleton component
 * For use within components that need inline loading states
 *
 * Note: For route-level loading, use loading.tsx file convention instead
 * This component is for component-level loading states (e.g., within a form, modal, etc.)
 */

import { Box, CircularProgress, Typography, Stack } from "@mui/material";

export function LoadingSkeleton({
  message = "Loading...",
}: {
  message?: string;
}) {
  return (
    <Box
      component="main"
      sx={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to bottom, #111827, #000000)",
        color: "white",
      }}
    >
      <Stack spacing={2} alignItems="center" textAlign="center">
        <CircularProgress size={48} thickness={4} />
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ color: "gray" }}
        >
          {message}
        </Typography>
      </Stack>
    </Box>
  );
}
