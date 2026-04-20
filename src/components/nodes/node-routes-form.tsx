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
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/headscale/node/${encodeURIComponent(nodeId)}/approve_routes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routes: approved }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || data.message || "Failed to update routes");
        return;
      }
      const { node } = await res.json();
      onUpdated(node);
    } catch {
      setError("Failed to update routes");
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
            id={`route-${encodeURIComponent(route)}`}
            checked={approved.includes(route)}
            onCheckedChange={(checked) => {
              setApproved((prev) =>
                checked ? [...prev, route] : prev.filter((r) => r !== route)
              );
            }}
          />
          <Label htmlFor={`route-${encodeURIComponent(route)}`} className="font-mono text-xs">
            {route}
          </Label>
        </div>
      ))}
      <Button type="submit" size="sm" disabled={loading}>Save Routes</Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </form>
  );
}
