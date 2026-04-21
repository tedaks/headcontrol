import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely extracts an error message from an unknown JSON body.
 * Checks common fields: `error`, `message`.
 */
export function getErrorMessage(data: unknown, fallback: string): string {
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    return (
      (typeof obj.error === 'string' ? obj.error : undefined) ??
      (typeof obj.message === 'string' ? obj.message : undefined) ??
      fallback
    );
  }
  return fallback;
}
