import { describe, it, expect } from 'vitest';

import { OrderStatus } from './order.entity';
import {
  canAccept,
  canRequestRevision,
  canComplete,
  canCancel,
  getAvailableOrderActions,
  getPrimaryOrderAction,
  orderStatusLabel
} from './order-actions';

describe('order-actions', () => {
  it('canAccept: true only for Pending', () => {
    expect(canAccept({ status: OrderStatus.Pending })).toBe(true);
    expect(canAccept({ status: OrderStatus.Processing })).toBe(false);
    expect(canAccept({ status: OrderStatus.Completed })).toBe(false);
  });

  it('canRequestRevision: true only for Processing', () => {
    expect(canRequestRevision({ status: OrderStatus.Processing })).toBe(true);
    expect(canRequestRevision({ status: OrderStatus.Pending })).toBe(false);
    expect(canRequestRevision({ status: OrderStatus.Revision })).toBe(false);
  });

  it('canComplete: true for Processing and Revision', () => {
    expect(canComplete({ status: OrderStatus.Processing })).toBe(true);
    expect(canComplete({ status: OrderStatus.Revision })).toBe(true);
    expect(canComplete({ status: OrderStatus.Completed })).toBe(false);
    expect(canComplete({ status: OrderStatus.Pending })).toBe(false);
  });

  it('canCancel: allowed from non-terminal states', () => {
    expect(canCancel({ status: OrderStatus.Pending })).toBe(true);
    expect(canCancel({ status: OrderStatus.Processing })).toBe(true);
    expect(canCancel({ status: OrderStatus.Revision })).toBe(true);
    expect(canCancel({ status: OrderStatus.Completed })).toBe(false);
    expect(canCancel({ status: OrderStatus.Cancelled })).toBe(false);
    expect(canCancel({ status: OrderStatus.RevisionPending })).toBe(false);
  });

  it('getPrimaryOrderAction: returns the next logical action per status', () => {
    expect(getPrimaryOrderAction({ status: OrderStatus.Pending })).toBe('accept');
    expect(getPrimaryOrderAction({ status: OrderStatus.Processing })).toBe('requestRevision');
    expect(getPrimaryOrderAction({ status: OrderStatus.Revision })).toBe('complete');
    expect(getPrimaryOrderAction({ status: OrderStatus.Completed })).toBeNull();
    expect(getPrimaryOrderAction({ status: OrderStatus.Cancelled })).toBeNull();
  });

  it('getAvailableOrderActions: includes all applicable actions', () => {
    const pending = { status: OrderStatus.Pending };
    expect(getAvailableOrderActions(pending)).toContain('accept');
    expect(getAvailableOrderActions(pending)).toContain('cancel');
    expect(getAvailableOrderActions(pending)).not.toContain('requestRevision');
    expect(getAvailableOrderActions(pending)).not.toContain('complete');

    const processing = { status: OrderStatus.Processing };
    expect(getAvailableOrderActions(processing)).toContain('requestRevision');
    expect(getAvailableOrderActions(processing)).toContain('complete');
    expect(getAvailableOrderActions(processing)).toContain('cancel');
    expect(getAvailableOrderActions(processing)).not.toContain('accept');
  });

  it('orderStatusLabel: returns correct labels for all statuses', () => {
    expect(orderStatusLabel(OrderStatus.Pending)).toBe('PENDING');
    expect(orderStatusLabel(OrderStatus.Processing)).toBe('PROCESSING');
    expect(orderStatusLabel(OrderStatus.Revision)).toBe('REVISION');
    expect(orderStatusLabel(OrderStatus.Completed)).toBe('COMPLETED');
    expect(orderStatusLabel(OrderStatus.Cancelled)).toBe('CANCELLED');
    expect(orderStatusLabel(OrderStatus.RevisionPending)).toBe('REVISION_PENDING');
  });
});

