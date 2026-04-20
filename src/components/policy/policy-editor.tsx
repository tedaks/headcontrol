"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, FloppyDisk, Warning } from "@phosphor-icons/react";

interface PolicyEditorProps {
  initialPolicy: string;
}

export function PolicyEditor({ initialPolicy }: PolicyEditorProps) {
  const [policy, setPolicy] = useState(initialPolicy);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  function validateJson(): boolean {
    try {
      JSON.parse(policy);
      return true;
    } catch {
      return false;
    }
  }

  async function handleSave() {
    if (!validateJson()) {
      setError("Invalid JSON");
      return;
    }
    setError("");
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/headscale/policy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policy }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to save policy");
        return;
      }
      setSaveSuccess(true);
    } catch {
      setError("Request failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {validateJson() ? (
            <CheckCircle size={16} className="text-green-500" weight="fill" />
          ) : (
            <Warning size={16} className="text-destructive" weight="fill" />
          )}
          <span className="text-xs text-muted-foreground">
            {validateJson() ? "Valid JSON" : "Invalid JSON"}
          </span>
        </div>
        <Button size="sm" onClick={handleSave} disabled={saving || !validateJson()}>
          <FloppyDisk size={14} className="mr-1" />
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
      <Textarea
        value={policy}
        onChange={(e) => { setPolicy(e.target.value); setSaveSuccess(false); setError(""); }}
        className="min-h-[500px] font-mono text-xs"
        spellCheck={false}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      {saveSuccess && <p className="text-sm text-green-500">Policy saved successfully</p>}
    </div>
  );
}