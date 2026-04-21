"use client";

import { useState } from "react";
import type { ApiKey } from "@/lib/types";
import { headscaleApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreateApiKeyDialog } from "./create-apikey-dialog";
import { useConfirm } from "@/components/ui/confirm-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShieldPlus, Clock, Trash } from "@phosphor-icons/react";

export function ApiKeyTable({ apiKeys: initialKeys }: { apiKeys: ApiKey[] }) {
  const [apiKeys, setApiKeys] = useState(initialKeys);
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState("");
  const { confirm, dialog } = useConfirm();

  async function expireKey(prefix: string) {
    setError("");
    try {
      await headscaleApi.apiKeys.expire(prefix);
      setApiKeys((prev) =>
        prev.map((k) =>
          k.prefix === prefix
            ? { ...k, expiration: new Date(0).toISOString() }
            : k
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to expire API key");
    }
  }

  async function deleteKey(prefix: string, id: string) {
    setError("");
    try {
      await headscaleApi.apiKeys.delete(prefix, id);
      setApiKeys((prev) => prev.filter((k) => !(k.prefix === prefix && k.id === id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete API key");
    }
  }

  function isExpired(key: ApiKey): boolean {
    if (!key.expiration) return false;
    return new Date(key.expiration) < new Date();
  }

  return (
    <div className="space-y-4">
      {dialog}
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <ShieldPlus size={16} className="mr-1" />
          Create API Key
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="rounded-none border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Prefix</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Last Seen</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No API keys found
                </TableCell>
              </TableRow>
            )}
            {apiKeys.map((key) => (
              <TableRow key={`${key.prefix}-${key.id}`}>
                <TableCell className="font-mono text-xs">{key.prefix}...</TableCell>
                <TableCell>
                  <Badge variant={isExpired(key) ? "secondary" : "default"}>
                    {isExpired(key) ? "Expired" : "Active"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {key.createdAt ? new Date(key.createdAt).toLocaleString() : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {key.expiration ? new Date(key.expiration).toLocaleString() : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {key.lastSeen ? new Date(key.lastSeen).toLocaleString() : "—"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {!isExpired(key) && (
                      <Button variant="ghost" size="icon-xs" onClick={() => {
                        confirm({
                          title: "Expire API Key",
                          description: "Are you sure you want to expire this API key?",
                          confirmLabel: "Expire",
                          onConfirm: () => expireKey(key.prefix),
                        });
                      }}>
                        <Clock size={14} />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon-xs" onClick={() => {
                      confirm({
                        title: "Delete API Key",
                        description: "Are you sure you want to delete this API key?",
                        destructive: true,
                        confirmLabel: "Delete",
                        onConfirm: () => deleteKey(key.prefix, key.id),
                      });
                    }}>
                      <Trash size={14} className="text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CreateApiKeyDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onKeyCreated={(newKey) => {
          setApiKeys((prev) => [...prev, newKey]);
          setCreateOpen(false);
        }}
      />
    </div>
  );
}
