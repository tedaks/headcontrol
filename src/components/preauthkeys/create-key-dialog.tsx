"use client";

import { useState } from "react";
import type { PreAuthKey, User } from "@/lib/types";
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
import { Switch } from "@/components/ui/switch";

interface CreateKeyDialogProps {
  users: User[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onKeyCreated: (key: PreAuthKey) => void;
}

export function CreateKeyDialog({ users, open, onOpenChange, onKeyCreated }: CreateKeyDialogProps) {
  const [userId, setUserId] = useState(users[0]?.id ?? "");
  const [reusable, setReusable] = useState(false);
  const [ephemeral, setEphemeral] = useState(false);
  const [expiration, setExpiration] = useState("");
  const [aclTags, setAclTags] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body: Record<string, unknown> = { user: userId, reusable, ephemeral };
      if (expiration) body.expiration = new Date(expiration).toISOString();
      if (aclTags) body.aclTags = aclTags.split(",").map((t) => t.trim()).filter(Boolean);

      const res = await fetch("/api/headscale/preauthkey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to create key");
        return;
      }
      const { preAuthKey } = await res.json();
      setCreatedKey(preAuthKey.key);
      onKeyCreated(preAuthKey);
    } catch {
      setError("Request failed");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setCreatedKey(null);
    setReusable(false);
    setEphemeral(false);
    setExpiration("");
    setAclTags("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Pre-Auth Key</DialogTitle>
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
              <Label>User</Label>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm"
                required
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="reusable" checked={reusable} onCheckedChange={setReusable} />
              <Label htmlFor="reusable">Reusable</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="ephemeral" checked={ephemeral} onCheckedChange={setEphemeral} />
              <Label htmlFor="ephemeral">Ephemeral</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiration">Expiration</Label>
              <Input
                id="expiration"
                type="datetime-local"
                value={expiration}
                onChange={(e) => setExpiration(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">ACL Tags</Label>
              <Input
                id="tags"
                placeholder="tag:group, tag:role"
                value={aclTags}
                onChange={(e) => setAclTags(e.target.value)}
                className="font-mono text-xs"
              />
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