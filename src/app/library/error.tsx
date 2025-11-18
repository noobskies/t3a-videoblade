"use client";

/**
 * Error boundary for the library route
 * Automatically catches errors from page.tsx and child components
 * Provides reset functionality to retry
 */

import { useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import { ErrorOutline } from "@mui/icons-material";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console (or error reporting service like Sentry)
    console.error("Library error:", error);
  }, [error]);

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <ErrorOutline
          sx={{ fontSize: 48, color: "error.main", mb: 2, mx: "auto" }}
        />
        <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold" }}>
          Something went wrong
        </Typography>
        <Typography variant="body1" color="error" sx={{ mb: 3 }}>
          {error.message}
        </Typography>
        <Button onClick={reset} variant="outlined">
          Try Again
        </Button>
      </Box>
    </Box>
  );
}
