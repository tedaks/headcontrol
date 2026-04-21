"use client";

import { Button } from "@/components/ui/button";

export default function UsersError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Users</h1>
      <p className="text-sm text-destructive">{error.message || "Failed to load users"}</p>
      <Button onClick={reset} size="sm">Try again</Button>
    </div>
  );
}
