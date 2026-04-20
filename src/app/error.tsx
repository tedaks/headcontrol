"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 p-8">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-destructive">{error.message || "An unexpected error occurred"}</p>
      <button
        onClick={reset}
        className="rounded-none bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/80"
      >
        Try again
      </button>
    </div>
  );
}
