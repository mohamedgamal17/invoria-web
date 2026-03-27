import { describe, it, expect } from 'vitest';
import { canTransition, canEditOrder, OrderState } from './order';

describe('Order State Machine', () => {
  describe('canTransition', () => {
    it('should allow valid transitions from PENDING', () => {
      expect(canTransition('PENDING', 'ACCEPTED')).toBe(true);
      expect(canTransition('PENDING', 'CANCELLED')).toBe(true);
    });

    it('should NOT allow invalid transitions from PENDING', () => {
      expect(canTransition('PENDING', 'COMPLETED')).toBe(false);
      expect(canTransition('PENDING', 'REFUSED')).toBe(false);
      expect(canTransition('PENDING', 'REOPENED')).toBe(false);
    });

    it('should allow valid transitions from ACCEPTED', () => {
      expect(canTransition('ACCEPTED', 'COMPLETED')).toBe(true);
      expect(canTransition('ACCEPTED', 'REFUSED')).toBe(true);
      expect(canTransition('ACCEPTED', 'REOPENED')).toBe(true);
    });

    it('should NOT allow invalid transitions from ACCEPTED', () => {
      expect(canTransition('ACCEPTED', 'PENDING')).toBe(false);
      expect(canTransition('ACCEPTED', 'CANCELLED')).toBe(false);
    });

    it('should allow valid transitions from REOPENED', () => {
      expect(canTransition('REOPENED', 'ACCEPTED')).toBe(true);
      expect(canTransition('REOPENED', 'CANCELLED')).toBe(true);
    });

    it('should NOT allow transitions from terminal states', () => {
      const terminalStates: OrderState[] = ['COMPLETED', 'CANCELLED', 'REFUSED'];
      const allStates: OrderState[] = ['PENDING', 'ACCEPTED', 'REOPENED', 'COMPLETED', 'CANCELLED', 'REFUSED'];

      terminalStates.forEach(from => {
        allStates.forEach(to => {
          expect(canTransition(from, to)).toBe(false);
        });
      });
    });
  });

  describe('canEditOrder', () => {
    it('should allow editing in PENDING and REOPENED states', () => {
      expect(canEditOrder('PENDING')).toBe(true);
      expect(canEditOrder('REOPENED')).toBe(true);
    });

    it('should NOT allow editing in other states', () => {
      expect(canEditOrder('ACCEPTED')).toBe(false);
      expect(canEditOrder('COMPLETED')).toBe(false);
      expect(canEditOrder('CANCELLED')).toBe(false);
      expect(canEditOrder('REFUSED')).toBe(false);
    });
  });
});
