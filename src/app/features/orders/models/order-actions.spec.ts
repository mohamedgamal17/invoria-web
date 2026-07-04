import { describe, it, expect } from 'vitest';

import { OrderStatus } from './order.entity';
import {
  canAccept,
  canEditOrder,
  canRequestRevision,
  canComplete,
  canCancel,
  getAvailableOrderActions,
  getPrimaryOrderAction,
  orderStatusLabel
} from './order-actions';

describe('order-actions', () => {
  it('canAccept: true for Pending and Revision', () => {
    expect(canAccept({ status: OrderStatus.Pending, orderAllocated: false })).toBe(true);
    expect(canAccept({ status: OrderStatus.Revision, orderAllocated: false })).toBe(true);
    expect(canAccept({ status: OrderStatus.Processing, orderAllocated: false })).toBe(false);
    expect(canAccept({ status: OrderStatus.Completed, orderAllocated: false })).toBe(false);
    expect(canAccept({ status: OrderStatus.RevisionPending, orderAllocated: false })).toBe(false);
  });

  it('canRequestRevision: true only for Processing when allocated', () => {
    expect(canRequestRevision({ status: OrderStatus.Processing, orderAllocated: true })).toBe(true);
    expect(canRequestRevision({ status: OrderStatus.Processing, orderAllocated: false })).toBe(false);
    expect(canRequestRevision({ status: OrderStatus.Pending, orderAllocated: false })).toBe(false);
    expect(canRequestRevision({ status: OrderStatus.Revision, orderAllocated: false })).toBe(false);
  });

  it('canComplete: true only when allocated for Processing and Revision', () => {
    expect(canComplete({ status: OrderStatus.Processing, orderAllocated: true })).toBe(true);
    expect(canComplete({ status: OrderStatus.Revision, orderAllocated: true })).toBe(true);
    expect(canComplete({ status: OrderStatus.Processing, orderAllocated: false })).toBe(false);
    expect(canComplete({ status: OrderStatus.Revision, orderAllocated: false })).toBe(false);
    expect(canComplete({ status: OrderStatus.Completed, orderAllocated: true })).toBe(false);
    expect(canComplete({ status: OrderStatus.Pending, orderAllocated: true })).toBe(false);
  });

  it('canCancel: allowed from non-terminal states', () => {
    expect(canCancel({ status: OrderStatus.Pending, orderAllocated: false })).toBe(true);
    expect(canCancel({ status: OrderStatus.Processing, orderAllocated: false })).toBe(true);
    expect(canCancel({ status: OrderStatus.Revision, orderAllocated: false })).toBe(true);
    expect(canCancel({ status: OrderStatus.Completed, orderAllocated: false })).toBe(false);
    expect(canCancel({ status: OrderStatus.Cancelled, orderAllocated: false })).toBe(false);
    expect(canCancel({ status: OrderStatus.RevisionPending, orderAllocated: false })).toBe(false);
  });

  it('canEditOrder: true for Pending and Revision', () => {
    expect(canEditOrder({ status: OrderStatus.Pending, orderAllocated: false })).toBe(true);
    expect(canEditOrder({ status: OrderStatus.Revision, orderAllocated: false })).toBe(true);
    expect(canEditOrder({ status: OrderStatus.Processing, orderAllocated: false })).toBe(false);
    expect(canEditOrder({ status: OrderStatus.Completed, orderAllocated: false })).toBe(false);
    expect(canEditOrder({ status: OrderStatus.Cancelled, orderAllocated: false })).toBe(false);
  });

  it('getPrimaryOrderAction: returns the next logical action per status', () => {
    expect(getPrimaryOrderAction({ status: OrderStatus.Pending, orderAllocated: false })).toBe('accept');
    expect(getPrimaryOrderAction({ status: OrderStatus.Processing, orderAllocated: true })).toBe('complete');
    expect(getPrimaryOrderAction({ status: OrderStatus.Revision, orderAllocated: false })).toBe('accept');
    expect(getPrimaryOrderAction({ status: OrderStatus.Revision, orderAllocated: true })).toBe('complete');
    expect(getPrimaryOrderAction({ status: OrderStatus.Completed, orderAllocated: true })).toBeNull();
    expect(getPrimaryOrderAction({ status: OrderStatus.Cancelled, orderAllocated: false })).toBeNull();
  });

  it('getAvailableOrderActions: includes all applicable actions', () => {
    const pending = { status: OrderStatus.Pending, orderAllocated: false };
    expect(getAvailableOrderActions(pending)).toContain('accept');
    expect(getAvailableOrderActions(pending)).toContain('edit');
    expect(getAvailableOrderActions(pending)).toContain('cancel');
    expect(getAvailableOrderActions(pending)).not.toContain('requestRevision');
    expect(getAvailableOrderActions(pending)).not.toContain('complete');

    const processing = { status: OrderStatus.Processing, orderAllocated: true };
    expect(getAvailableOrderActions(processing)).toContain('requestRevision');
    expect(getAvailableOrderActions(processing)).toContain('complete');
    expect(getAvailableOrderActions(processing)).toContain('cancel');
    expect(getAvailableOrderActions(processing)).not.toContain('accept');

    const processingNotAllocated = { status: OrderStatus.Processing, orderAllocated: false };
    expect(getAvailableOrderActions(processingNotAllocated)).not.toContain('complete');

    const revision = { status: OrderStatus.Revision, orderAllocated: false };
    expect(getAvailableOrderActions(revision)).toContain('accept');
    expect(getAvailableOrderActions(revision)).toContain('edit');
    expect(getAvailableOrderActions(revision)).toContain('cancel');
    expect(getAvailableOrderActions(revision)).not.toContain('requestRevision');
    expect(getAvailableOrderActions(revision)).not.toContain('complete');
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

