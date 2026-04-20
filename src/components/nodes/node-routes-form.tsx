"use client";

import { useState } from "react";
import type { Node } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RoadHorizon } from "@phosphor-icons/react";

interface NodeRoutesFormProps {
  nodeId: string;
  availableRoutes: string[];
  approvedRoutes: string[];
  onUpdated: (node: Node) => void;
}

export function NodeRoutesForm({ nodeId, availableRoutes, approvedRoutes, onUpdated }: NodeRoutesFormProps) {
  const [approved, setApproved] = useState<string[]>(approvedRoutes);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/headscale/node/${nodeId}/approve_routes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routes: approved }),
      });
      if (res.ok) {
        const { node } = await res.json();
        onUpdated(node);
      }
    } finally {
      setLoading(false);
    }
  }

  if (availableRoutes.length === 0) {
    return (
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <RoadHorizon size={14} />
        No routes advertised
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <RoadHorizon size={14} className="text-muted-foreground" />
        <span className="text-muted-foreground">Subnet Routes</span>
      </div>
      {availableRoutes.map((route) => (
        <div key={route} className="flex items-center gap-2">
          <Switch
            id={`route-${route}`}
            checked={approved.includes(route)}
            onCheckedChange={(checked) => {
              setApproved((prev) =>
                checked ? [...prev, route] : prev.filter((r) => r !== route)
              );
            }}
          />
          <Label htmlFor={`route-${route}`} className="font-mono text-xs">
            {route}
          </Label>
        </div>
      ))}
      <Button type="submit" size="sm" disabled={loading}>Save Routes</Button>
    </form>
  );
}
