import { describe, expect, it } from 'vitest';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { PurchaseOrder } from '../../models/purchase-order.entity';
import { PurchaseState } from '../../enums/purchase-state.enum';
import { PURCHASE_ORDERS_LIST_ACTIONS } from './purchase-orders-list.actions';
import {
  PURCHASE_ORDERS_LIST_INITIAL_STATE,
  purchaseOrdersListReducer,
  type PurchaseOrdersListState,
} from './purchase-orders-list.reducer';

const EMPTY_PAGE_INFO = { length: 0, skip: 0, totalCount: 0 };

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

describe('purchaseOrdersListReducer', () => {
  describe('setQueryFromUrl', () => {
    it('returns the same state object when the query already matches (number normalized)', () => {
      const primed: PurchaseOrdersListState = {
        ...PURCHASE_ORDERS_LIST_INITIAL_STATE,
        numberFilter: 'PO-1',
      };
      const next = purchaseOrdersListReducer(primed, {
        ...PURCHASE_ORDERS_LIST_ACTIONS.setQueryFromUrl({
          pageIndex: 0,
          pageSize: 25,
          numberFilter: ' PO-1 ',
          statusFilter: null,
        }),
      });
      expect(next).toBe(primed);
      expect(next.numberFilter).toBe('PO-1');
    });

    it('replaces the query values on a real change', () => {
      const next = purchaseOrdersListReducer(PURCHASE_ORDERS_LIST_INITIAL_STATE, {
        ...PURCHASE_ORDERS_LIST_ACTIONS.setQueryFromUrl({
          pageIndex: 3,
          pageSize: 50,
          numberFilter: 'PO-1',
          statusFilter: PurchaseState.Approved,
        }),
      });
      expect(next.pageIndex).toBe(3);
      expect(next.pageSize).toBe(50);
      expect(next.numberFilter).toBe('PO-1');
      expect(next.statusFilter).toBe(PurchaseState.Approved);
    });
  });

  describe('loadPurchaseOrders (the state decides whether the API is called)', () => {
    it('starts loading on the first trigger', () => {
      const next = purchaseOrdersListReducer(PURCHASE_ORDERS_LIST_INITIAL_STATE, {
        ...PURCHASE_ORDERS_LIST_ACTIONS.loadPurchaseOrders(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
      expect(next.fetchedQuery?.pageIndex).toBe(0);
      expect(next.fetchedQuery?.pageSize).toBe(25);
      expect(next.fetchedQuery?.numberFilter).toBe('');
      expect(next.fetchedQuery?.statusFilter).toBeNull();
    });

    it('does not start a second request for the same query once loaded', () => {
      let state = purchaseOrdersListReducer(PURCHASE_ORDERS_LIST_INITIAL_STATE, {
        ...PURCHASE_ORDERS_LIST_ACTIONS.loadPurchaseOrders(),
      });
      state = purchaseOrdersListReducer(state, {
        ...PURCHASE_ORDERS_LIST_ACTIONS.loadPurchaseOrdersSuccess({
          purchaseOrders: [],
          info: EMPTY_PAGE_INFO,
        }),
      });
      const next = purchaseOrdersListReducer(state, {
        ...PURCHASE_ORDERS_LIST_ACTIONS.loadPurchaseOrders(),
      });
      expect(next).toBe(state);
      expect(next.request.status).toBe(LOAD_STATUS.Loaded);
    });

    it('does not restart an in-flight request for the same query', () => {
      let state = purchaseOrdersListReducer(PURCHASE_ORDERS_LIST_INITIAL_STATE, {
        ...PURCHASE_ORDERS_LIST_ACTIONS.loadPurchaseOrders(),
      });
      const next = purchaseOrdersListReducer(state, {
        ...PURCHASE_ORDERS_LIST_ACTIONS.loadPurchaseOrders(),
      });
      expect(next).toBe(state);
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });

    it('starts a new request when any query part changed', () => {
      let state = purchaseOrdersListReducer(PURCHASE_ORDERS_LIST_INITIAL_STATE, {
        ...PURCHASE_ORDERS_LIST_ACTIONS.setQueryFromUrl({
          pageIndex: 0,
          pageSize: 25,
          numberFilter: '',
          statusFilter: null,
        }),
      });
      state = purchaseOrdersListReducer(state, {
        ...PURCHASE_ORDERS_LIST_ACTIONS.loadPurchaseOrders(),
      });
      state = purchaseOrdersListReducer(state, {
        ...PURCHASE_ORDERS_LIST_ACTIONS.loadPurchaseOrdersSuccess({
          purchaseOrders: [],
          info: EMPTY_PAGE_INFO,
        }),
      });
      state = purchaseOrdersListReducer(state, {
        ...PURCHASE_ORDERS_LIST_ACTIONS.setQueryFromUrl({
          pageIndex: 0,
          pageSize: 25,
          numberFilter: '',
          statusFilter: PurchaseState.Submitted,
        }),
      });
      const next = purchaseOrdersListReducer(state, {
        ...PURCHASE_ORDERS_LIST_ACTIONS.loadPurchaseOrders(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
      expect(next.fetchedQuery?.statusFilter).toBe(PurchaseState.Submitted);
    });

    it('is re-triggerable for the same query after a failure', () => {
      let state = purchaseOrdersListReducer(PURCHASE_ORDERS_LIST_INITIAL_STATE, {
        ...PURCHASE_ORDERS_LIST_ACTIONS.loadPurchaseOrders(),
      });
      state = purchaseOrdersListReducer(state, {
        ...PURCHASE_ORDERS_LIST_ACTIONS.loadPurchaseOrdersFailure({ error: new Error('boom') }),
      });
      expect(state.fetchedQuery).toBeNull();
      expect(state.request.status).toBe(LOAD_STATUS.Error);
      const next = purchaseOrdersListReducer(state, {
        ...PURCHASE_ORDERS_LIST_ACTIONS.loadPurchaseOrders(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });
  });

  describe('loadPurchaseOrdersSuccess', () => {
    it('stores purchase orders and paging info and clears the error', () => {
      let state = purchaseOrdersListReducer(PURCHASE_ORDERS_LIST_INITIAL_STATE, {
        ...PURCHASE_ORDERS_LIST_ACTIONS.loadPurchaseOrdersFailure({ error: new Error('boom') }),
      });
      const next = purchaseOrdersListReducer(state, {
        ...PURCHASE_ORDERS_LIST_ACTIONS.loadPurchaseOrdersSuccess({
          purchaseOrders: [PURCHASE_ORDER],
          info: { length: 25, skip: 0, totalCount: 1 },
        }),
      });
      expect(next.purchaseOrders).toHaveLength(1);
      expect(next.info?.totalCount).toBe(1);
      expect(next.request.status).toBe(LOAD_STATUS.Loaded);
      expect(next.request.error).toBeNull();
    });
  });

  describe('loadPurchaseOrdersFailure', () => {
    it('clears the list, paging info and fetched query', () => {
      let state = purchaseOrdersListReducer(PURCHASE_ORDERS_LIST_INITIAL_STATE, {
        ...PURCHASE_ORDERS_LIST_ACTIONS.loadPurchaseOrders(),
      });
      state = purchaseOrdersListReducer(state, {
        ...PURCHASE_ORDERS_LIST_ACTIONS.loadPurchaseOrdersSuccess({
          purchaseOrders: [PURCHASE_ORDER],
          info: { length: 25, skip: 0, totalCount: 1 },
        }),
      });
      const next = purchaseOrdersListReducer(state, {
        ...PURCHASE_ORDERS_LIST_ACTIONS.loadPurchaseOrdersFailure({ error: new Error('boom') }),
      });
      expect(next.purchaseOrders).toEqual([]);
      expect(next.info).toBeNull();
      expect(next.fetchedQuery).toBeNull();
      expect(next.request.status).toBe(LOAD_STATUS.Error);
    });
  });

  describe('purchaseOrderUpdated (local sync, no refetch)', () => {
    const UPDATED_PURCHASE_ORDER: PurchaseOrder = {
      ...PURCHASE_ORDER,
      state: PurchaseState.Submitted,
    };

    function loadedState(
      overrides: Partial<PurchaseOrdersListState> = {},
    ): PurchaseOrdersListState {
      let state = purchaseOrdersListReducer(PURCHASE_ORDERS_LIST_INITIAL_STATE, {
        ...PURCHASE_ORDERS_LIST_ACTIONS.loadPurchaseOrders(),
      });
      state = purchaseOrdersListReducer(state, {
        ...PURCHASE_ORDERS_LIST_ACTIONS.loadPurchaseOrdersSuccess({
          purchaseOrders: [PURCHASE_ORDER],
          info: { length: 1, skip: 0, totalCount: 1 },
        }),
      });
      return { ...state, ...overrides };
    }

    it('replaces the purchase order in place when it is on the current page', () => {
      const state = loadedState();
      const next = purchaseOrdersListReducer(state, {
        ...PURCHASE_ORDERS_LIST_ACTIONS.purchaseOrderUpdated({
          purchaseOrder: UPDATED_PURCHASE_ORDER,
        }),
      });
      expect(next.purchaseOrders).toEqual([UPDATED_PURCHASE_ORDER]);
      expect(next.info?.totalCount).toBe(1);
      expect(next.request).toBe(state.request);
      expect(next.fetchedQuery).toBe(state.fetchedQuery);
    });

    it('returns the same state when the purchase order is not on the current page', () => {
      const state = loadedState();
      const other: PurchaseOrder = { ...UPDATED_PURCHASE_ORDER, id: 'po_other' };
      const next = purchaseOrdersListReducer(state, {
        ...PURCHASE_ORDERS_LIST_ACTIONS.purchaseOrderUpdated({ purchaseOrder: other }),
      });
      expect(next).toBe(state);
    });

    it('returns the same state when the page was never loaded', () => {
      const next = purchaseOrdersListReducer(PURCHASE_ORDERS_LIST_INITIAL_STATE, {
        ...PURCHASE_ORDERS_LIST_ACTIONS.purchaseOrderUpdated({
          purchaseOrder: UPDATED_PURCHASE_ORDER,
        }),
      });
      expect(next).toBe(PURCHASE_ORDERS_LIST_INITIAL_STATE);
    });
  });
});
