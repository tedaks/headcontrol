'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function ApiKeysError({ error, reset }: { error: Error; reset: () => void }) {
  const [attempts, setAttempts] = useState(0);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">API Keys</h1>
      <p className="text-destructive text-sm">{error.message || 'Failed to load API keys'}</p>
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
