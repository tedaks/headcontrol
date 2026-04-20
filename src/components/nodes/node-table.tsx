"use client";

import { useState } from "react";
import type { Node } from "@/lib/types";
import { REGISTER_METHOD_LABELS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NodeDetailDialog } from "./node-detail-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function NodeTable({ nodes: initialNodes }: { nodes: Node[] }) {
  const [nodes, setNodes] = useState(initialNodes);
  const [detailNode, setDetailNode] = useState<Node | null>(null);

  function updateNode(updated: Node) {
    setNodes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
  }

  return (
    <>
      <div className="rounded-none border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>User</TableHead>
              <TableHead>IP Addresses</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Last Seen</TableHead>
              <TableHead>Expiry</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {nodes.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No nodes found
                </TableCell>
              </TableRow>
            )}
            {nodes.map((node) => (
              <TableRow
                key={node.id}
                className="cursor-pointer"
                onClick={() => setDetailNode(node)}
              >
                <TableCell>
                  <Badge variant={node.online ? "default" : "secondary"}>
                    {node.online ? "Online" : "Offline"}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{node.givenName || node.name}</TableCell>
                <TableCell>{node.user?.name || "—"}</TableCell>
                <TableCell className="font-mono text-xs">
                  {node.ipAddresses?.join(", ") || "—"}
                </TableCell>
                <TableCell>
                  {REGISTER_METHOD_LABELS[node.registerMethod] || node.registerMethod}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {node.lastSeen ? new Date(node.lastSeen).toLocaleString() : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {node.expiry ? (
                    new Date(node.expiry) < new Date() ? (
                      <span className="text-destructive">Expired</span>
                    ) : (
                      new Date(node.expiry).toLocaleDateString()
                    )
                  ) : (
                    "Never"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {detailNode && (
        <NodeDetailDialog
          node={detailNode}
          open={!!detailNode}
          onOpenChange={(open) => { if (!open) setDetailNode(null); }}
          onNodeUpdated={updateNode}
          onNodeDeleted={() => {
            setNodes((prev) => prev.filter((n) => n.id !== detailNode.id));
            setDetailNode(null);
          }}
        />
      )}
    </>
  );
}
