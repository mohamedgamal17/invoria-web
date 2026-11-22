import { describe, it, expect } from 'vitest';

import { PurchaseState } from '../enums/purchase-state.enum';
import {
  canEditPurchaseOrder,
  getPurchaseOrderTransitionActions
} from './purchase-order-actions';

describe('purchase-order-actions', () => {
  it('canEditPurchaseOrder is true only for Draft and Reopened', () => {
    expect(canEditPurchaseOrder(PurchaseState.Draft)).toBe(true);
    expect(canEditPurchaseOrder(PurchaseState.Reopened)).toBe(true);
    expect(canEditPurchaseOrder(PurchaseState.Submitted)).toBe(false);
    expect(canEditPurchaseOrder(PurchaseState.Approved)).toBe(false);
    expect(canEditPurchaseOrder(PurchaseState.Completed)).toBe(false);
  });

  it('getPurchaseOrderTransitionActions matches workflow', () => {
    expect(getPurchaseOrderTransitionActions(PurchaseState.Draft)).toEqual(['submit', 'cancel']);
    expect(getPurchaseOrderTransitionActions(PurchaseState.Submitted)).toEqual([
      'approve',
      'reject',
      'reopen',
      'cancel'
    ]);
    expect(getPurchaseOrderTransitionActions(PurchaseState.Reopened)).toEqual(['submit', 'cancel']);
    expect(getPurchaseOrderTransitionActions(PurchaseState.Approved)).toEqual(['reopen', 'complete']);
    expect(getPurchaseOrderTransitionActions(PurchaseState.Completed)).toEqual([]);
  });
});
