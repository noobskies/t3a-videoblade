/**
 * Reusable error alert component
 * For use within components that need inline error displays
 *
 * Note: For route-level errors, use error.tsx file convention instead
 * This component is for component-level error states (e.g., form validation, API errors within a component, etc.)
 */

import { ErrorOutline } from "@mui/icons-material";
import { Box, Button, Typography, Stack } from "@mui/material";

type ErrorAlertProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorAlert({ message, onRetry }: ErrorAlertProps) {
  return (
    <Box
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
        <ErrorOutline sx={{ fontSize: 48, color: "error.main" }} />
        <Typography color="error.main" variant="body1">
          Error: {message}
        </Typography>
        {onRetry && (
          <Button onClick={onRetry} variant="outlined" color="inherit">
            Try Again
          </Button>
        )}
      </Stack>
    </Box>
  );
}
