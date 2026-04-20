"use client";

import { useState } from "react";
import type { PreAuthKey, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreateKeyDialog } from "./create-key-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Key, Clock } from "@phosphor-icons/react";

export function KeyTable({ keys: initialKeys, users }: { keys: PreAuthKey[]; users: User[] }) {
  const [keys, setKeys] = useState(initialKeys);
  const [createOpen, setCreateOpen] = useState(false);

  async function expireKey(id: string) {
    if (!confirm("Expire this key?")) return;
    await fetch("/api/headscale/preauthkey/expire", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, expiration: new Date().toISOString() } : k))
    );
  }

  function isExpired(key: PreAuthKey): boolean {
    if (!key.expiration) return false;
    return new Date(key.expiration) < new Date();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Key size={16} className="mr-1" />
          Create Key
        </Button>
      </div>

      <div className="rounded-none border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reusable</TableHead>
              <TableHead>Ephemeral</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No pre-auth keys found
                </TableCell>
              </TableRow>
            )}
            {keys.map((key) => (
              <TableRow key={key.id}>
                <TableCell className="font-mono text-xs">{key.id}</TableCell>
                <TableCell>{key.user?.name}</TableCell>
                <TableCell>
                  <Badge variant={isExpired(key) || key.used ? "secondary" : "default"}>
                    {isExpired(key) ? "Expired" : key.used ? "Used" : "Active"}
                  </Badge>
                </TableCell>
                <TableCell>{key.reusable ? "Yes" : "No"}</TableCell>
                <TableCell>{key.ephemeral ? "Yes" : "No"}</TableCell>
                <TableCell className="font-mono text-xs">
                  {key.aclTags?.length > 0 ? key.aclTags.join(", ") : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {key.expiration ? new Date(key.expiration).toLocaleString() : "—"}
                </TableCell>
                <TableCell>
                  {!isExpired(key) && (
                    <Button variant="ghost" size="icon-xs" onClick={() => expireKey(key.id)}>
                      <Clock size={14} />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CreateKeyDialog
        users={users}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onKeyCreated={(key) => {
          setKeys((prev) => [...prev, key]);
          setCreateOpen(false);
        }}
      />
    </div>
  );
}