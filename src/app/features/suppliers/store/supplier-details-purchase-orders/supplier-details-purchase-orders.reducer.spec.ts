import { describe, expect, it } from 'vitest';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import { SUPPLIER_PURCHASE_ORDERS_ACTIONS } from './supplier-details-purchase-orders.actions';
import {
  SUPPLIER_PURCHASE_ORDERS_INITIAL_STATE,
  supplierPurchaseOrdersReducer,
  DEFAULT_PURCHASE_ORDERS_PAGE_SIZE,
  type SupplierPurchaseOrdersState,
} from './supplier-details-purchase-orders.reducer';

const EMPTY_FILTERS = {
  purchaseNumber: '',
  status: null,
};

/** Initial state with the supplier context and the tab gate open — preconditions for any fetch. */
function primedState(): SupplierPurchaseOrdersState {
  return supplierPurchaseOrdersReducer(
    supplierPurchaseOrdersReducer(SUPPLIER_PURCHASE_ORDERS_INITIAL_STATE, {
      ...SUPPLIER_PURCHASE_ORDERS_ACTIONS.reset({ supplierId: 'sup_1' }),
    }),
    { ...SUPPLIER_PURCHASE_ORDERS_ACTIONS.purchaseOrdersTabOpened() },
  );
}

describe('supplierPurchaseOrdersReducer', () => {
  describe('pageChange', () => {
    it('returns the same state object when paging values are identical', () => {
      const primed = { ...primedState(), pageIndex: 2, pageSize: 50 };
      const next = supplierPurchaseOrdersReducer(primed, {
        ...SUPPLIER_PURCHASE_ORDERS_ACTIONS.pageChange({ pageIndex: 2, pageSize: 50 }),
      });
      expect(next).toBe(primed);
    });

    it('updates on a real change', () => {
      const primed = { ...primedState(), pageIndex: 0, pageSize: 25 };
      const next = supplierPurchaseOrdersReducer(primed, {
        ...SUPPLIER_PURCHASE_ORDERS_ACTIONS.pageChange({ pageIndex: 1, pageSize: 25 }),
      });
      expect(next).not.toBe(primed);
      expect(next.pageIndex).toBe(1);
    });
  });

  describe('filtersChange', () => {
    it('returns the same state object when filters already match (purchaseNumber trimmed)', () => {
      const primed = { ...primedState(), filters: { ...EMPTY_FILTERS, purchaseNumber: 'PO-7' } };
      const next = supplierPurchaseOrdersReducer(primed, {
        ...SUPPLIER_PURCHASE_ORDERS_ACTIONS.filtersChange({
          filters: { ...EMPTY_FILTERS, purchaseNumber: '  PO-7  ' },
        }),
      });
      expect(next).toBe(primed);
    });

    it('resets paging and stores the filters on a real change', () => {
      const primed = { ...primedState(), pageIndex: 4, filters: EMPTY_FILTERS };
      const filters = { ...EMPTY_FILTERS, status: 1 };
      const next = supplierPurchaseOrdersReducer(primed, {
        ...SUPPLIER_PURCHASE_ORDERS_ACTIONS.filtersChange({ filters }),
      });
      expect(next.pageIndex).toBe(0);
      expect(next.filters).toEqual(filters);
    });
  });

  describe('filtersClear', () => {
    it('returns the same state object when filters are already empty', () => {
      const primed = { ...primedState(), filters: EMPTY_FILTERS };
      const next = supplierPurchaseOrdersReducer(primed, {
        ...SUPPLIER_PURCHASE_ORDERS_ACTIONS.filtersClear(),
      });
      expect(next).toBe(primed);
    });

    it('resets paging and filters on a real clear', () => {
      const primed = { ...primedState(), pageIndex: 3, filters: { ...EMPTY_FILTERS, status: 2 } };
      const next = supplierPurchaseOrdersReducer(primed, {
        ...SUPPLIER_PURCHASE_ORDERS_ACTIONS.filtersClear(),
      });
      expect(next.pageIndex).toBe(0);
      expect(next.filters).toEqual(EMPTY_FILTERS);
    });
  });

  describe('setPagingFromUrl', () => {
    it('applies the paging values and no-ops when nothing changes', () => {
      const primed = { ...primedState(), pageIndex: 2, pageSize: 50 };
      const next = supplierPurchaseOrdersReducer(primed, {
        ...SUPPLIER_PURCHASE_ORDERS_ACTIONS.setPagingFromUrl({ pageIndex: 2, pageSize: 50 }),
      });
      expect(next).toBe(primed);
      expect(next.pageIndex).toBe(2);
      expect(next.pageSize).toBe(50);
    });

    it('replaces both paging values from the query', () => {
      const primed = { ...primedState(), pageIndex: 0, pageSize: 25 };
      const next = supplierPurchaseOrdersReducer(primed, {
        ...SUPPLIER_PURCHASE_ORDERS_ACTIONS.setPagingFromUrl({ pageIndex: 3, pageSize: 50 }),
      });
      expect(next.pageIndex).toBe(3);
      expect(next.pageSize).toBe(50);
    });
  });

  describe('reset', () => {
    it('clears the slice and stores the incoming supplier id', () => {
      const state = supplierPurchaseOrdersReducer(primedState(), {
        ...SUPPLIER_PURCHASE_ORDERS_ACTIONS.loadPurchaseOrders(),
      });
      const next = supplierPurchaseOrdersReducer(state, {
        ...SUPPLIER_PURCHASE_ORDERS_ACTIONS.reset({ supplierId: 'sup_2' }),
      });
      expect(next.supplierId).toBe('sup_2');
      expect(next.purchaseOrdersTabOpened).toBe(false);
      expect(next.request.status).toBe(LOAD_STATUS.Idle);
      expect(next.purchaseOrders).toEqual([]);
    });
  });

  describe('loadPurchaseOrders (the state decides whether the API is called)', () => {
    it('stays idle when the tab gate is closed', () => {
      const primed = supplierPurchaseOrdersReducer(SUPPLIER_PURCHASE_ORDERS_INITIAL_STATE, {
        ...SUPPLIER_PURCHASE_ORDERS_ACTIONS.reset({ supplierId: 'sup_1' }),
      });
      const next = supplierPurchaseOrdersReducer(primed, {
        ...SUPPLIER_PURCHASE_ORDERS_ACTIONS.loadPurchaseOrders(),
      });
      expect(next).toBe(primed);
      expect(next.request.status).toBe(LOAD_STATUS.Idle);
    });

    it('stays idle while the supplier context is unknown', () => {
      let state = SUPPLIER_PURCHASE_ORDERS_INITIAL_STATE;
      state = supplierPurchaseOrdersReducer(state, {
        ...SUPPLIER_PURCHASE_ORDERS_ACTIONS.purchaseOrdersTabOpened(),
      });
      const next = supplierPurchaseOrdersReducer(state, {
        ...SUPPLIER_PURCHASE_ORDERS_ACTIONS.loadPurchaseOrders(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Idle);
    });

    it('starts loading on the first trigger', () => {
      const primed = primedState();
      const next = supplierPurchaseOrdersReducer(primed, {
        ...SUPPLIER_PURCHASE_ORDERS_ACTIONS.loadPurchaseOrders(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
      expect(next.fetchedQuery?.pageIndex).toBe(0);
      expect(next.fetchedQuery?.pageSize).toBe(DEFAULT_PURCHASE_ORDERS_PAGE_SIZE);
    });

    it('does not start a second request for the same query once loaded', () => {
      let state = supplierPurchaseOrdersReducer(primedState(), {
        ...SUPPLIER_PURCHASE_ORDERS_ACTIONS.loadPurchaseOrders(),
      });
      state = supplierPurchaseOrdersReducer(state, {
        ...SUPPLIER_PURCHASE_ORDERS_ACTIONS.loadPurchaseOrdersSuccess({
          purchaseOrders: [],
          info: { length: 0, skip: 0, totalCount: 0 },
        }),
      });
      const next = supplierPurchaseOrdersReducer(state, {
        ...SUPPLIER_PURCHASE_ORDERS_ACTIONS.loadPurchaseOrders(),
      });
      expect(next).toBe(state);
      expect(next.request.status).toBe(LOAD_STATUS.Loaded);
    });

    it('does not restart an in-flight request for the same query', () => {
      let state = supplierPurchaseOrdersReducer(primedState(), {
        ...SUPPLIER_PURCHASE_ORDERS_ACTIONS.loadPurchaseOrders(),
      });
      const next = supplierPurchaseOrdersReducer(state, {
        ...SUPPLIER_PURCHASE_ORDERS_ACTIONS.loadPurchaseOrders(),
      });
      expect(next).toBe(state);
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });

    it('starts a new request when the query actually changed', () => {
      let state = supplierPurchaseOrdersReducer(primedState(), {
        ...SUPPLIER_PURCHASE_ORDERS_ACTIONS.loadPurchaseOrders(),
      });
      state = supplierPurchaseOrdersReducer(state, {
        ...SUPPLIER_PURCHASE_ORDERS_ACTIONS.loadPurchaseOrdersSuccess({
          purchaseOrders: [],
          info: { length: 0, skip: 0, totalCount: 0 },
        }),
      });
      state = supplierPurchaseOrdersReducer(state, {
        ...SUPPLIER_PURCHASE_ORDERS_ACTIONS.pageChange({ pageIndex: 1, pageSize: 25 }),
      });
      const next = supplierPurchaseOrdersReducer(state, {
        ...SUPPLIER_PURCHASE_ORDERS_ACTIONS.loadPurchaseOrders(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
      expect(next.fetchedQuery?.pageIndex).toBe(1);
    });

    it('is re-triggerable for the same query after a failure', () => {
      let state = supplierPurchaseOrdersReducer(primedState(), {
        ...SUPPLIER_PURCHASE_ORDERS_ACTIONS.loadPurchaseOrders(),
      });
      state = supplierPurchaseOrdersReducer(state, {
        ...SUPPLIER_PURCHASE_ORDERS_ACTIONS.loadPurchaseOrdersFailure({ error: new Error('boom') }),
      });
      expect(state.fetchedQuery).toBeNull();
      const next = supplierPurchaseOrdersReducer(state, {
        ...SUPPLIER_PURCHASE_ORDERS_ACTIONS.loadPurchaseOrders(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });
  });
});
