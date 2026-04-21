'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, FloppyDisk, Warning } from '@phosphor-icons/react';
import { headscaleApi } from '@/lib/api-client';

interface PolicyEditorProps {
  initialPolicy: string;
}

export function PolicyEditor({ initialPolicy }: PolicyEditorProps) {
  const [policy, setPolicy] = useState(initialPolicy);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  function validateJson(text: string): boolean {
    try {
      JSON.parse(text);
      return true;
    } catch {
      return false;
    }
  }

  const isValid = validateJson(policy);

  async function handleSave() {
    if (!isValid) {
      setError('Invalid JSON');
      return;
    }
    setError('');
    setSaving(true);
    setSaveSuccess(false);
    try {
      await headscaleApi.policy.set(policy);
      setSaveSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isValid ? (
            <CheckCircle size={16} className="text-green-500" weight="fill" />
          ) : (
            <Warning size={16} className="text-destructive" weight="fill" />
          )}
          <span className="text-muted-foreground text-xs">
            {isValid ? 'Valid JSON' : 'Invalid JSON'}
          </span>
        </div>
        <Button size="sm" onClick={handleSave} disabled={saving || !isValid}>
          <FloppyDisk size={14} className="mr-1" />
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
      <Textarea
        value={policy}
        onChange={(e) => {
          setPolicy(e.target.value);
          setSaveSuccess(false);
          setError('');
        }}
        className="min-h-[500px] font-mono text-xs"
        spellCheck={false}
      />
      {error && <p className="text-destructive text-sm">{error}</p>}
      {saveSuccess && <p className="text-sm text-green-500">Policy saved successfully</p>}
    </div>
  );
}
