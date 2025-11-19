/**
 * Loading Skeleton Component
 * Reusable loading state for component-level loading
 * (For route-level loading, use loading.tsx in app directory)
 */

import { Stack, CircularProgress, Typography } from "@mui/material";

export function LoadingSkeleton({
  message = "Loading...",
}: {
  message?: string;
}) {
  return (
    <Stack
      spacing={2}
      alignItems="center"
      justifyContent="center"
      sx={{ py: 10 }}
    >
      <CircularProgress size={48} />
      <Typography color="text.secondary">{message}</Typography>
    </Stack>
  );
}
