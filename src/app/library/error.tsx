"use client";

/**
 * Error boundary for the library route
 * Automatically catches errors from page.tsx and child components
 * Provides reset functionality to retry
 */

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
        <h2 className="mb-2 text-2xl font-bold">Something went wrong</h2>
        <p className="mb-4 text-red-400">{error.message}</p>
        <Button onClick={reset} variant="outline">
          Try Again
        </Button>
      </div>
    </main>
  );
}
