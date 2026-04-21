'use client';

import { useState } from 'react';
import type { Node } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil } from '@phosphor-icons/react';
import { headscaleApi } from '@/lib/api-client';

interface NodeRenameFormProps {
  nodeId: string;
  currentName: string;
  onRenamed: (node: Node) => void;
}

export function NodeRenameForm({ nodeId, currentName, onRenamed }: NodeRenameFormProps) {
  const [name, setName] = useState(currentName);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name === currentName) {
      setEditing(false);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { node } = await headscaleApi.nodes.rename(nodeId, name);
      onRenamed(node);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename node');
    } finally {
      setLoading(false);
    }
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Name</span>
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
          {currentName} <Pencil size={12} className="ml-1" />
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="text-muted-foreground text-sm">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
        </div>
        <Button type="submit" size="sm" disabled={loading}>
          Save
        </Button>
      </div>
      {error && <p className="text-destructive text-xs">{error}</p>}
    </form>
  );
}
