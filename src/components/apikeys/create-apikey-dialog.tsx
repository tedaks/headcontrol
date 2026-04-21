"use client";

import { useState } from "react";
import type { ApiKey } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/utils";

interface CreateApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onKeyCreated: (key: ApiKey) => void;
}

export function CreateApiKeyDialog({ open, onOpenChange, onKeyCreated }: CreateApiKeyDialogProps) {
  const [expiration, setExpiration] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body: { expiration?: string } = {};
      if (expiration) body.expiration = new Date(expiration).toISOString();

      const res = await fetch("/api/headscale/apikey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(getErrorMessage(data, "Failed to create API key"));
        return;
      }
      const data = await res.json();
      const apiKeyString: string = data.apiKey;
      setCreatedKey(apiKeyString);
      // Re-fetch API keys list to get the full ApiKey object with prefix/id/etc.
      try {
        const listRes = await fetch("/api/headscale/apikey");
        if (listRes.ok) {
          const { apiKeys } = await listRes.json();
          // The newest key should be the one we just created — find by matching or take last
          const newKey = (apiKeys as ApiKey[]).find((k) => !k.expiration || new Date(k.expiration) > new Date());
          if (newKey) onKeyCreated(newKey);
        }
      } catch {
        // Non-critical: the table will refresh on next page load
      }
    } catch {
      setError("Request failed");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setCreatedKey(null);
    setExpiration("");
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
            <p className="text-sm text-muted-foreground">Copy this key now. It won&apos;t be shown again.</p>
            <div className="rounded-none border border-border bg-muted p-3 font-mono text-xs break-all">
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
              <p className="text-xs text-muted-foreground">Defaults to 90 days if not set</p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
