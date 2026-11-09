import { describe, expect, it } from 'vitest';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import {
  PURCHASE_ORDERS_MUTATIONS_INITIAL_STATE,
  purchaseOrdersMutationsReducer,
  type PurchaseOrdersMutationsState,
} from './purchase-orders-mutations.reducer';
import { PURCHASE_ORDERS_MUTATIONS_ACTIONS } from './purchase-orders-mutations.actions';

function primedLoadingState(): PurchaseOrdersMutationsState {
  return purchaseOrdersMutationsReducer(PURCHASE_ORDERS_MUTATIONS_INITIAL_STATE, {
    ...PURCHASE_ORDERS_MUTATIONS_ACTIONS.transitionPurchaseOrder({
      id: 'po_1',
      action: 'submit',
    }),
  });
}

describe('purchaseOrdersMutationsReducer', () => {
  describe('transitionPurchaseOrder (double-submit guard)', () => {
    it('starts loading on the first dispatch', () => {
      const next = primedLoadingState();
      expect(next.transitionRequest.status).toBe(LOAD_STATUS.Loading);
      expect(next.transitionRequest.error).toBeNull();
    });

    it('returns the same state when a transition is already in flight', () => {
      const state = primedLoadingState();
      const next = purchaseOrdersMutationsReducer(state, {
        ...PURCHASE_ORDERS_MUTATIONS_ACTIONS.transitionPurchaseOrder({
          id: 'po_1',
          action: 'approve',
        }),
      });
      expect(next).toBe(state);
    });
  });

  describe('transitionPurchaseOrderSuccess', () => {
    it('marks the transition request as loaded after a failure (matches the products-mutations semantics)', () => {
      let state = primedLoadingState();
      state = purchaseOrdersMutationsReducer(state, {
        ...PURCHASE_ORDERS_MUTATIONS_ACTIONS.transitionPurchaseOrderFailure({
          error: new Error('boom'),
        }),
      });
      const next = purchaseOrdersMutationsReducer(state, {
        ...PURCHASE_ORDERS_MUTATIONS_ACTIONS.transitionPurchaseOrderSuccess({
          purchaseOrder: {
            id: 'po_1',
            createdAt: '',
            purchaseNumber: 'PO-001',
            supplierId: 'sup_1',
            state: 2,
            subTotal: 0,
            totalAmount: 0,
          },
        }),
      });
      expect(next.transitionRequest.status).toBe(LOAD_STATUS.Loaded);
    });
  });

  describe('transitionPurchaseOrderFailure', () => {
    it('stores the inline error detail and bumps the failure nonce', () => {
      const state = primedLoadingState();
      const next = purchaseOrdersMutationsReducer(state, {
        ...PURCHASE_ORDERS_MUTATIONS_ACTIONS.transitionPurchaseOrderFailure({
          error: new Error('boom'),
        }),
      });
      expect(next.transitionRequest.status).toBe(LOAD_STATUS.Error);
      expect(next.transitionRequest.error).toBe('boom');
      expect(next.transitionRequest.failureNonce).toBe(1);
    });
  });
});
