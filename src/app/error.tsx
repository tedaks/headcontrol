'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  const [attempts, setAttempts] = useState(0);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 p-8">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-destructive text-sm">{error.message || 'An unexpected error occurred'}</p>
      <Button
        onClick={() => {
          setAttempts((a) => a + 1);
          reset();
        }}
        size="sm"
      >
        Try again
      </Button>
      {attempts >= 1 && (
        <Button onClick={() => window.location.reload()} size="sm" variant="outline">
          Reload page
        </Button>
      )}
    </div>
  );
}
