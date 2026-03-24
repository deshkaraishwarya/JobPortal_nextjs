export default function Loading() {
  /**
   * WHY loading.tsx?
   * Next.js 14 App Router automatically wraps layouts and pages in React Suspense.
   * If any page in this directory (or its subdirectories) is `async` and awaits
   * data fetching, Next.js will instantly render THIS loading UI instead of
   * leaving the user on a blank screen.
   *
   * It is automatically swapped out as soon as the data resolves!
   */
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-500 font-medium animate-pulse">
        Loading JobTrackr...
      </p>
    </div>
  );
}
