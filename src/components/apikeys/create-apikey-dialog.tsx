'use client';

import { useState } from 'react';
import type { ApiKey } from '@/lib/types';
import { headscaleApi } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreateApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onKeyCreated: (key: ApiKey) => void;
}

export function CreateApiKeyDialog({ open, onOpenChange, onKeyCreated }: CreateApiKeyDialogProps) {
  const [expiration, setExpiration] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const expirationIso = expiration ? new Date(expiration).toISOString() : undefined;

      const data = await headscaleApi.apiKeys.create(expirationIso);
      const apiKeyString: string = data.apiKey;
      setCreatedKey(apiKeyString);
      // Re-fetch API keys list to get the full ApiKey object with prefix/id/etc.
      try {
        const listData = await headscaleApi.apiKeys.list();
        // The newest key should be the one we just created — find by matching or take last
        const newKey = listData.apiKeys.find(
          (k) => !k.expiration || new Date(k.expiration) > new Date()
        );
        if (newKey) onKeyCreated(newKey);
      } catch {
        // Non-critical: the table will refresh on next page load
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setCreatedKey(null);
    setExpiration('');
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
        </DialogHeader>
        {createdKey ? (
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm">
              Copy this key now. It won&apos;t be shown again.
            </p>
            <div className="border-border bg-muted rounded-none border p-3 font-mono text-xs break-all">
              {createdKey}
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expiration">Expiration (optional)</Label>
              <Input
                id="expiration"
                type="datetime-local"
                value={expiration}
                onChange={(e) => setExpiration(e.target.value)}
              />
              <p className="text-muted-foreground text-xs">Defaults to 90 days if not set</p>
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
