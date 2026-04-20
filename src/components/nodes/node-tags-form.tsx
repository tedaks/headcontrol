"use client";

import { useState } from "react";
import type { Node } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag } from "@phosphor-icons/react";

interface NodeTagsFormProps {
  nodeId: string;
  currentTags: string[];
  onUpdated: (node: Node) => void;
}

export function NodeTagsForm({ nodeId, currentTags, onUpdated }: NodeTagsFormProps) {
  const [tags, setTags] = useState(currentTags.join(", "));
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
      const res = await fetch(`/api/headscale/node/${nodeId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: tagList }),
      });
      if (res.ok) {
        const { node } = await res.json();
        onUpdated(node);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <Tag size={14} className="text-muted-foreground" />
        <span className="text-muted-foreground">Tags</span>
      </div>
      <div className="flex gap-2">
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="tag:group, tag:role"
          disabled={loading}
          className="text-xs font-mono"
        />
        <Button type="submit" size="sm" disabled={loading}>Save</Button>
      </div>
    </form>
  );
}
