import { signal, type Signal } from '@angular/core';

export interface ClipboardNotifier {
  readonly copiedKey: Signal<string | null>;
  copy(value: string, key: string): void;
}

/**
 * Creates a signal-driven clipboard copy notifier that temporarily tracks
 * which key was copied for feedback in UI templates (e.g. tooltip or icon change).
 */
export function createClipboardNotifier(timeoutMs = 500): ClipboardNotifier {
  const copiedKeySignal = signal<string | null>(null);

  const copy = (value: string, key: string): void => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(value);
    }
    copiedKeySignal.set(key);
    setTimeout(() => {
      copiedKeySignal.set(null);
    }, timeoutMs);
  };

  return {
    copiedKey: copiedKeySignal.asReadonly(),
    copy,
  };
}
