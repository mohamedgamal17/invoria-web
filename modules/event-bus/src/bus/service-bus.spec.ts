import { describe, it, expect, beforeEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { ServiceBus } from './service-bus';

describe('ServiceBus', () => {
  let bus: ServiceBus;

  beforeEach(() => {
    bus = new ServiceBus();
  });

  describe('publish and on', () => {
    it('should receive published events on matching topic', () => {
      const received: string[] = [];
      const sub = bus.on<string>('test.topic').subscribe((value) => {
        received.push(value);
      });

      bus.publish('test.topic', 'message 1');
      bus.publish('other.topic', 'ignored');
      bus.publish('test.topic', 'message 2');

      expect(received).toEqual(['message 1', 'message 2']);
      sub.unsubscribe();
    });
  });

  describe('handle and request', () => {
    it('should handle synchronous handler response', () => {
      bus.handle<{ id: string }, { name: string }>('query.user', (req) => ({
        name: `User ${req.id}`
      }));

      let result: { name: string } | undefined;
      bus.request<{ id: string }, { name: string }>('query.user', { id: '42' }).subscribe((res) => {
        result = res;
      });

      expect(result).toEqual({ name: 'User 42' });
    });

    it('should handle Observable handler response', () => {
      bus.handle<{ id: string }, { name: string }>('query.user', (req) =>
        of({ name: `User ${req.id}` })
      );

      let result: { name: string } | undefined;
      bus.request<{ id: string }, { name: string }>('query.user', { id: '99' }).subscribe((res) => {
        result = res;
      });

      expect(result).toEqual({ name: 'User 99' });
    });

    it('should throw an error if registering duplicate handler for same topic', () => {
      bus.handle('duplicate.topic', () => 'one');
      expect(() => {
        bus.handle('duplicate.topic', () => 'two');
      }).toThrowError(/already registered/i);
    });

    it('should error when requesting a topic with no registered handler', () => {
      let seenError: unknown;
      bus.request('unknown.topic', {}).subscribe({
        next: () => {},
        error: (err) => {
          seenError = err;
        }
      });

      expect(seenError).toBeInstanceOf(Error);
      expect((seenError as Error).message).toMatch(/No service bus handler registered/i);
    });
  });

  describe('lifecycle', () => {
    it('should clean up subscriptions and handlers on ngOnDestroy', () => {
      bus.handle('some.topic', () => 'ok');
      bus.ngOnDestroy();

      let seenError: unknown;
      bus.request('some.topic', {}).subscribe({
        next: () => {},
        error: (err) => {
          seenError = err;
        }
      });

      expect(seenError).toBeTruthy();
    });
  });
});
