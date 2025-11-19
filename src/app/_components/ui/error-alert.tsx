/**
 * Error Alert Component
 * Reusable error state for component-level errors
 * (For route-level errors, use error.tsx in app directory)
 */

import { Alert, AlertTitle, Button, Stack } from "@mui/material";
import { ErrorOutline } from "@mui/icons-material";

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorAlert({
  title = "Error",
  message,
  onRetry,
}: ErrorAlertProps) {
  return (
    <Stack spacing={2} sx={{ py: 4 }}>
      <Alert severity="error" icon={<ErrorOutline />}>
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>
      {onRetry && (
        <Button variant="outlined" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </Stack>
  );
}
