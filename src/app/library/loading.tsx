/**
 * Loading state for the library route
 * Automatically displayed by Next.js while page.tsx is loading
 * Can be a server component (no "use client" needed)
 */

import { Container, Stack, CircularProgress, Typography } from "@mui/material";

export default function Loading() {
  return (
    <Container maxWidth="xl" component="main" sx={{ py: 4 }}>
      <Stack
        spacing={2}
        alignItems="center"
        justifyContent="center"
        sx={{ minHeight: "60vh" }}
      >
        <CircularProgress size={48} />
        <Typography color="text.secondary">Loading videos...</Typography>
      </Stack>
    </Container>
  );
}
