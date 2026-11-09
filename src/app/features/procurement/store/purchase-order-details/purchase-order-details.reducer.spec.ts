import { describe, expect, it } from 'vitest';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { PurchaseOrder } from '../../models/purchase-order.entity';
import { PurchaseState } from '../../enums/purchase-state.enum';
import { PURCHASE_ORDERS_MUTATIONS_ACTIONS } from '../purchase-orders-mutations/purchase-orders-mutations.actions';
import { PURCHASE_ORDER_DETAILS_ACTIONS } from './purchase-order-details.actions';
import {
  PURCHASE_ORDER_DETAILS_INITIAL_STATE,
  PurchaseOrderDetailsTab,
  purchaseOrderDetailsReducer,
  type PurchaseOrderDetailsState,
} from './purchase-order-details.reducer';

const PURCHASE_ORDER: PurchaseOrder = {
  id: 'po_1',
  createdAt: '2026-01-01T00:00:00.000Z',
  purchaseNumber: 'PO-001',
  supplierId: 'sup_1',
  supplier: { id: 'sup_1', name: 'Acme Supplies' },
  state: PurchaseState.Draft,
  subTotal: 100,
  totalAmount: 114,
};

const TRANSITIONED_PURCHASE_ORDER: PurchaseOrder = {
  ...PURCHASE_ORDER,
  state: PurchaseState.Submitted,
};

function loadedState(
  overrides: Partial<PurchaseOrderDetailsState> = {},
): PurchaseOrderDetailsState {
  let state = purchaseOrderDetailsReducer(PURCHASE_ORDER_DETAILS_INITIAL_STATE, {
    ...PURCHASE_ORDER_DETAILS_ACTIONS.loadPurchaseOrder({ purchaseOrderId: 'po_1' }),
  });
  state = purchaseOrderDetailsReducer(state, {
    ...PURCHASE_ORDER_DETAILS_ACTIONS.loadPurchaseOrderSuccess({ purchaseOrder: PURCHASE_ORDER }),
  });
  return { ...state, ...overrides };
}

describe('purchaseOrderDetailsReducer', () => {
  describe('loadPurchaseOrder', () => {
    it('clears the entity and name lookups and starts loading', () => {
      const state = loadedState();
      const next = purchaseOrderDetailsReducer(state, {
        ...PURCHASE_ORDER_DETAILS_ACTIONS.loadPurchaseOrder({ purchaseOrderId: 'po_2' }),
      });
      expect(next.purchaseOrderId).toBe('po_2');
      expect(next.purchaseOrder).toBeNull();
      expect(next.productNamesById.size).toBe(0);
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });
  });

  describe('loadPurchaseOrderSuccess', () => {
    it('stores the entity and marks the request loaded', () => {
      const next = purchaseOrderDetailsReducer(PURCHASE_ORDER_DETAILS_INITIAL_STATE, {
        ...PURCHASE_ORDER_DETAILS_ACTIONS.loadPurchaseOrderSuccess({
          purchaseOrder: PURCHASE_ORDER,
        }),
      });
      expect(next.purchaseOrder).toBe(PURCHASE_ORDER);
      expect(next.request.status).toBe(LOAD_STATUS.Loaded);
      expect(next.request.error).toBeNull();
    });
  });

  describe('loadPurchaseOrderFailure', () => {
    it('clears the entity and stores the inline error', () => {
      let state = purchaseOrderDetailsReducer(PURCHASE_ORDER_DETAILS_INITIAL_STATE, {
        ...PURCHASE_ORDER_DETAILS_ACTIONS.loadPurchaseOrder({ purchaseOrderId: 'po_1' }),
      });
      const next = purchaseOrderDetailsReducer(state, {
        ...PURCHASE_ORDER_DETAILS_ACTIONS.loadPurchaseOrderFailure({ error: new Error('boom') }),
      });
      expect(next.purchaseOrder).toBeNull();
      expect(next.request.status).toBe(LOAD_STATUS.Error);
      expect(next.request.error).toBe('boom');
    });
  });

  describe('setActiveTab', () => {
    it('stores a real tab change and no-ops identical values', () => {
      const state = loadedState();
      const changed = purchaseOrderDetailsReducer(state, {
        ...PURCHASE_ORDER_DETAILS_ACTIONS.setActiveTab({
          activeTab: PurchaseOrderDetailsTab.History,
        }),
      });
      expect(changed.activeTab).toBe(PurchaseOrderDetailsTab.History);

      const noOp = purchaseOrderDetailsReducer(changed, {
        ...PURCHASE_ORDER_DETAILS_ACTIONS.setActiveTab({
          activeTab: PurchaseOrderDetailsTab.History,
        }),
      });
      expect(noOp).toBe(changed);
    });
  });

  describe('productNamesResolved', () => {
    it('stores the resolved lookup map', () => {
      const state = loadedState();
      const names = new Map([['prod_1', 'Resolved product name']]);
      const next = purchaseOrderDetailsReducer(state, {
        ...PURCHASE_ORDER_DETAILS_ACTIONS.productNamesResolved({ names }),
      });
      expect(next.productNamesById.get('prod_1')).toBe('Resolved product name');
    });
  });

  describe('silent sync from purchase-orders-mutations (transitionPurchaseOrderSuccess)', () => {
    it('folds the returned entity in place when the store holds the same id', () => {
      const state = loadedState();
      const next = purchaseOrderDetailsReducer(state, {
        ...PURCHASE_ORDERS_MUTATIONS_ACTIONS.transitionPurchaseOrderSuccess({
          purchaseOrder: TRANSITIONED_PURCHASE_ORDER,
        }),
      });
      expect(next.purchaseOrder).toBe(TRANSITIONED_PURCHASE_ORDER);
      expect(next.request.status).toBe(LOAD_STATUS.Loaded);
    });

    it('returns the same state when the store holds a different id', () => {
      const state = loadedState();
      const other: PurchaseOrder = { ...TRANSITIONED_PURCHASE_ORDER, id: 'po_other' };
      const next = purchaseOrderDetailsReducer(state, {
        ...PURCHASE_ORDERS_MUTATIONS_ACTIONS.transitionPurchaseOrderSuccess({
          purchaseOrder: other,
        }),
      });
      expect(next).toBe(state);
    });

    it('returns the same state when no entity is held', () => {
      const next = purchaseOrderDetailsReducer(PURCHASE_ORDER_DETAILS_INITIAL_STATE, {
        ...PURCHASE_ORDERS_MUTATIONS_ACTIONS.transitionPurchaseOrderSuccess({
          purchaseOrder: TRANSITIONED_PURCHASE_ORDER,
        }),
      });
      expect(next).toBe(PURCHASE_ORDER_DETAILS_INITIAL_STATE);
    });
  });
});
