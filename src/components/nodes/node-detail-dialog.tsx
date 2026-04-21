"use client";

import { useState } from "react";
import type { Node } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { NodeRenameForm } from "./node-rename-form";
import { NodeTagsForm } from "./node-tags-form";
import { NodeRoutesForm } from "./node-routes-form";
import { Trash, ClockCounterClockwise } from "@phosphor-icons/react";
import { headscaleApi } from "@/lib/api-client";

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
  const [error, setError] = useState("");
  const { confirm, dialog } = useConfirm();

  async function expireNode() {
    setError("");
    try {
      const { node: updated } = await headscaleApi.nodes.expire(node.id);
      onNodeUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to expire node");
    }
  }

  async function deleteNode() {
    setError("");
    try {
      await headscaleApi.nodes.delete(node.id);
      onNodeDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete node");
    }
  }

  function promptExpire() {
    confirm({
      title: "Expire Node",
      description: "Are you sure you want to expire this node? It will no longer be able to connect.",
      confirmLabel: "Expire",
      onConfirm: expireNode,
    });
  }

  function promptDelete() {
    confirm({
      title: "Delete Node",
      description: "Are you sure you want to delete this node? This action cannot be undone.",
      destructive: true,
      confirmLabel: "Delete",
      onConfirm: deleteNode,
    });
  }

  return (
    <>
      {dialog}
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
              <div className="font-mono text-xs">
                {Array.isArray(node.ipAddresses) && node.ipAddresses.length > 0
                  ? node.ipAddresses.join(", ")
                  : "—"}
              </div>
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

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={promptExpire}>
                <ClockCounterClockwise size={14} className="mr-1" />
                Expire
              </Button>
              <Button variant="destructive" size="sm" onClick={promptDelete}>
                <Trash size={14} className="mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
