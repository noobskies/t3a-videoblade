/**
 * Reusable error alert component
 * For use within components that need inline error displays
 *
 * Note: For route-level errors, use error.tsx file convention instead
 * This component is for component-level error states (e.g., form validation, API errors within a component, etc.)
 */

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorAlertProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorAlert({ message, onRetry }: ErrorAlertProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
        <p className="mb-4 text-red-400">Error: {message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            Try Again
          </Button>
        )}
      </div>
    </main>
  );
}
