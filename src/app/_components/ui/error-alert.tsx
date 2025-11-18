/**
 * Reusable error alert component
 * For use within components that need inline error displays
 *
 * Note: For route-level errors, use error.tsx file convention instead
 * This component is for component-level error states (e.g., form validation, API errors within a component, etc.)
 */

import { Box, Typography, Button } from "@mui/material";
import { ErrorOutline } from "@mui/icons-material";

type ErrorAlertProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorAlert({ message, onRetry }: ErrorAlertProps) {
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
        <ErrorOutline sx={{ fontSize: 48, color: "error.main", mb: 2 }} />
        <Typography variant="body1" color="error" sx={{ mb: 3 }}>
          Error: {message}
        </Typography>
        {onRetry && (
          <Button onClick={onRetry} variant="outlined">
            Try Again
          </Button>
        )}
      </Box>
    </Box>
  );
}
