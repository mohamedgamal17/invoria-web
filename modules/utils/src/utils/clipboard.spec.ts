import { createClipboardNotifier } from './clipboard';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('createClipboardNotifier', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('sets copiedKey on copy and clears it after the timeout', () => {
    const notifier = createClipboardNotifier(300);
    expect(notifier.copiedKey()).toBeNull();

    notifier.copy('test-value', 'test-key');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test-value');
    expect(notifier.copiedKey()).toBe('test-key');

    vi.advanceTimersByTime(299);
    expect(notifier.copiedKey()).toBe('test-key');

    vi.advanceTimersByTime(2);
    expect(notifier.copiedKey()).toBeNull();
  });
});
