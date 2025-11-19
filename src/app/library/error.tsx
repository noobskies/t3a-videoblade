"use client";

/**
 * Error boundary for the library route
 * Automatically catches errors from page.tsx and child components
 * Provides reset functionality to retry
 */

import { useEffect } from "react";
import { ErrorOutline as AlertCircle } from "@mui/icons-material";
import {
  Button,
  Box,
  Typography,
  Stack,
  Alert,
  AlertTitle,
} from "@mui/material";

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
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        color: "text.primary",
        p: 3,
      }}
    >
      <Stack alignItems="center" spacing={3} maxWidth="sm">
        <AlertCircle sx={{ fontSize: 64, color: "error.main" }} />

        <Box textAlign="center">
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Something went wrong
          </Typography>
          <Alert
            severity="error"
            variant="outlined"
            sx={{ width: "100%", mb: 3, textAlign: "left" }}
          >
            <AlertTitle>Error Details</AlertTitle>
            {error.message}
          </Alert>
        </Box>

        <Button
          onClick={reset}
          variant="contained"
          color="primary"
          size="large"
        >
          Try Again
        </Button>
      </Stack>
    </Box>
  );
}
