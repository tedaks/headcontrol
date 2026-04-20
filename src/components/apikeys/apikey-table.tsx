"use client";

import { useState } from "react";
import type { ApiKey } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreateApiKeyDialog } from "./create-apikey-dialog";
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

  async function expireKey(prefix: string) {
    if (!confirm("Expire this API key?")) return;
    await fetch("/api/headscale/apikey/expire", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prefix }),
    });
    setApiKeys((prev) => prev.filter((k) => k.prefix !== prefix));
  }

  async function deleteKey(prefix: string, id: string) {
    if (!confirm("Delete this API key?")) return;
    await fetch(`/api/headscale/apikey/${prefix}?id=${id}`, { method: "DELETE" });
    setApiKeys((prev) => prev.filter((k) => k.prefix !== prefix));
  }

  function isExpired(key: ApiKey): boolean {
    if (!key.expiration) return false;
    return new Date(key.expiration) < new Date();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <ShieldPlus size={16} className="mr-1" />
          Create API Key
        </Button>
      </div>

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
              <TableRow key={key.prefix}>
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
                      <Button variant="ghost" size="icon-xs" onClick={() => expireKey(key.prefix)}>
                        <Clock size={14} />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon-xs" onClick={() => deleteKey(key.prefix, key.id)}>
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
        onKeyCreated={() => {
          setCreateOpen(false);
        }}
      />
    </div>
  );
}
