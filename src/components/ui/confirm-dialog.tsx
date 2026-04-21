'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-sm">{description}</p>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            size="sm"
            variant={destructive ? 'destructive' : 'default'}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook for managing confirmation dialog state.
 */
export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    destructive?: boolean;
  }>({
    open: false,
    title: '',
    description: '',
  });

  // Use a ref so the dialog can always invoke the latest callback,
  // even if the callback changes after `confirm()` is called.
  const onConfirmRef = useRef<(() => void) | null>(null);

  const confirm = useCallback(
    (options: {
      title: string;
      description: string;
      onConfirm: () => void;
      confirmLabel?: string;
      destructive?: boolean;
    }) => {
      onConfirmRef.current = options.onConfirm;
      setState({
        open: true,
        title: options.title,
        description: options.description,
        confirmLabel: options.confirmLabel,
        destructive: options.destructive,
      });
    },
    []
  );

  const close = useCallback(() => setState((p) => ({ ...p, open: false })), []);

  const handleConfirm = useCallback(() => {
    onConfirmRef.current?.();
    onConfirmRef.current = null;
  }, []);

  const dialog = (
    <ConfirmDialog
      open={state.open}
      onOpenChange={(open) => !open && close()}
      title={state.title}
      description={state.description}
      confirmLabel={state.confirmLabel}
      destructive={state.destructive}
      onConfirm={handleConfirm}
    />
  );

  return { confirm, close, dialog };
}
