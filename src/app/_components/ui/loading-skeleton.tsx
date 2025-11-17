/**
 * Reusable loading skeleton component
 * For use within components that need inline loading states
 *
 * Note: For route-level loading, use loading.tsx file convention instead
 * This component is for component-level loading states (e.g., within a form, modal, etc.)
 */

export function LoadingSkeleton({
  message = "Loading...",
}: {
  message?: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="text-center">
        <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-blue-500" />
        <p className="text-gray-400">{message}</p>
      </div>
    </main>
  );
}
