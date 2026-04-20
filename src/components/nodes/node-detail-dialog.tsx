"use client";

import type { Node } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { NodeRenameForm } from "./node-rename-form";
import { NodeTagsForm } from "./node-tags-form";
import { NodeRoutesForm } from "./node-routes-form";
import { Trash, ClockCounterClockwise } from "@phosphor-icons/react";

interface NodeDetailDialogProps {
  node: Node;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNodeUpdated: (node: Node) => void;
  onNodeDeleted: () => void;
}

export function NodeDetailDialog({
  node,
  open,
  onOpenChange,
  onNodeUpdated,
  onNodeDeleted,
}: NodeDetailDialogProps) {
  async function expireNode() {
    if (!confirm("Expire this node?")) return;
    const res = await fetch(`/api/headscale/node/${node.id}/expire?disableExpiry=false`, {
      method: "POST",
    });
    if (res.ok) {
      const { node: updated } = await res.json();
      onNodeUpdated(updated);
    }
  }

  async function deleteNode() {
    if (!confirm("Delete this node? This cannot be undone.")) return;
    const res = await fetch(`/api/headscale/node/${node.id}`, { method: "DELETE" });
    if (res.ok) onNodeDeleted();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{node.givenName || node.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">ID</div>
            <div>{node.id}</div>
            <div className="text-muted-foreground">User</div>
            <div>{node.user?.name}</div>
            <div className="text-muted-foreground">IPs</div>
            <div className="font-mono text-xs">{node.ipAddresses?.join(", ")}</div>
            <div className="text-muted-foreground">Created</div>
            <div>{node.createdAt ? new Date(node.createdAt).toLocaleString() : "—"}</div>
            <div className="text-muted-foreground">Expiry</div>
            <div>{node.expiry ? new Date(node.expiry).toLocaleString() : "Never"}</div>
          </div>

          <Separator />

          <NodeRenameForm nodeId={node.id} currentName={node.givenName || node.name} onRenamed={onNodeUpdated} />
          <NodeTagsForm nodeId={node.id} currentTags={node.tags || []} onUpdated={onNodeUpdated} />
          <NodeRoutesForm
            nodeId={node.id}
            availableRoutes={node.availableRoutes || []}
            approvedRoutes={node.approvedRoutes || []}
            onUpdated={onNodeUpdated}
          />

          <Separator />

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={expireNode}>
              <ClockCounterClockwise size={14} className="mr-1" />
              Expire
            </Button>
            <Button variant="destructive" size="sm" onClick={deleteNode}>
              <Trash size={14} className="mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
