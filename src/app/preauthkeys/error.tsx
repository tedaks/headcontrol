"use client";

export default function PreAuthKeysError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Pre-Auth Keys</h1>
      <p className="text-sm text-destructive">{error.message || "Failed to load pre-auth keys"}</p>
      <button onClick={reset} className="text-sm text-primary underline">
        Try again
      </button>
    </div>
  );
}
