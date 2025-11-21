/**
 * Reusable error alert component
 * For use within components that need inline error displays
 *
 * Note: For route-level errors, use error.tsx file convention instead
 * This component is for component-level error states (e.g., form validation, API errors within a component, etc.)
 */

import { Alert, AlertTitle, Box, Button } from "@mui/material";

type ErrorAlertProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorAlert({ message, onRetry }: ErrorAlertProps) {
  return (
    <Box sx={{ p: 2 }}>
      <Alert
        severity="error"
        action={
          onRetry ? (
            <Button color="inherit" size="small" onClick={onRetry}>
              Try Again
            </Button>
          ) : undefined
        }
      >
        <AlertTitle>Error</AlertTitle>
        {message}
      </Alert>
    </Box>
  );
}
