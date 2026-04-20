"use client";

import { useState } from "react";
import type { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { CreateUserDialog } from "./create-user-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash, UserPlus } from "@phosphor-icons/react";

export function UserTable({ users: initialUsers }: { users: User[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState("");

  async function deleteUser(id: string) {
    if (!confirm("Delete this user?")) return;
    setError("");
    try {
      const res = await fetch(`/api/headscale/user/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed to delete user" }));
        setError(data.error || data.message || "Failed to delete user");
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      setError("Failed to delete user");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <UserPlus size={16} className="mr-1" />
          Create User
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="rounded-none border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Display Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No users found
                </TableCell>
              </TableRow>
            )}
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.displayName || "—"}</TableCell>
                <TableCell>{user.email || "—"}</TableCell>
                <TableCell>{user.provider || "—"}</TableCell>
                <TableCell className="text-muted-foreground">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => deleteUser(user.id)}
                  >
                    <Trash size={14} className="text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onUserCreated={(user) => {
          setUsers((prev) => [...prev, user]);
          setCreateOpen(false);
        }}
      />
    </div>
  );
}
