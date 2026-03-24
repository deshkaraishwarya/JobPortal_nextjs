'use client'; // Error components must be Client Components

import { useEffect } from 'react';

/**
 * WHY error.tsx?
 * Next.js 14 automatically wraps layouts and pages in an Error Boundary.
 * If any page or layout throws an unhandled error during rendering or data fetching,
 * this component catches it instead of crashing the whole app.
 *
 * It provides a `reset` function to try recovering gracefully!
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production, log this to Sentry or Datadog
    console.error('JobTrackr Render Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="text-6xl mb-4">⚠️</div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">
        Something went wrong!
      </h2>
      <p className="text-slate-500 max-w-md mx-auto mb-8">
        We encountered an unexpected error while trying to load this page. Our engineers have been notified.
      </p>
      <button onClick={() => reset()} className="btn-primary">
        Try again
      </button>
    </div>
  );
}
