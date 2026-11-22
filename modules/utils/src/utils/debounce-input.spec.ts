import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createDebouncedInput } from './debounce-input';

describe('createDebouncedInput', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces emission and syncs local signal with external signal', () => {
    TestBed.runInInjectionContext(() => {
      const source = signal('initial');
      let emittedValue = '';
      const control = createDebouncedInput(
        source,
        (val) => {
          emittedValue = val;
        },
        200,
      );

      expect(control.value()).toBe('initial');

      control.set('typing');
      expect(control.value()).toBe('typing');
      expect(emittedValue).toBe('');

      vi.advanceTimersByTime(199);
      expect(emittedValue).toBe('');

      vi.advanceTimersByTime(2);
      expect(emittedValue).toBe('typing');
    });
  });
});
