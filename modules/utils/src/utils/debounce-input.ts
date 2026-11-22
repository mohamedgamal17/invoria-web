import { DestroyRef, effect, inject, signal, type Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SEARCH_DEBOUNCE_MS } from '../models/debounce';

export interface DebouncedInputControl {
  readonly value: Signal<string>;
  set(newValue: string): void;
}

/**
 * Creates a debounced input control for filter panels and search bars.
 * Automatically synchronizes an external input signal with internal draft state,
 * debouncing change emissions through RxJS and unsubscribing on destroy.
 */
export function createDebouncedInput(
  sourceSignal: Signal<string>,
  onDebouncedChange: (debouncedValue: string) => void,
  debounceMs: number = SEARCH_DEBOUNCE_MS,
): DebouncedInputControl {
  const destroyRef = inject(DestroyRef);
  const input$ = new Subject<string>();
  const localValue = signal(sourceSignal());

  effect(() => {
    localValue.set(sourceSignal());
  });

  input$
    .pipe(debounceTime(debounceMs), distinctUntilChanged(), takeUntilDestroyed(destroyRef))
    .subscribe((debouncedValue) => onDebouncedChange(debouncedValue));

  return {
    value: localValue.asReadonly(),
    set: (newValue: string): void => {
      localValue.set(newValue);
      input$.next(newValue);
    },
  };
}
