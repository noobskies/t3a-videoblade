/**
 * Loading state for the library route
 * Automatically displayed by Next.js while page.tsx is loading
 * Can be a server component (no "use client" needed)
 */

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="text-center">
        <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-blue-500" />
        <p className="text-gray-400">Loading videos...</p>
      </div>
    </main>
  );
}
