import { describe, expect, it } from 'vitest';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import { CUSTOMER_ORDERS_ACTIONS } from './customer-details-orders.actions';
import {
  CUSTOMER_ORDERS_INITIAL_STATE,
  customerOrdersReducer,
  DEFAULT_ORDERS_PAGE_SIZE,
  type CustomerOrdersState,
} from './customer-details-orders.reducer';

const EMPTY_FILTERS = {
  orderNumber: '',
  status: null,
  paymentStatus: null,
  paymentType: null,
};

/** Initial state with the customer context and the tab gate open — preconditions for any fetch. */
function primedState(): CustomerOrdersState {
  return customerOrdersReducer(
    customerOrdersReducer(CUSTOMER_ORDERS_INITIAL_STATE, {
      ...CUSTOMER_ORDERS_ACTIONS.reset({ customerId: 'cust_1' }),
    }),
    { ...CUSTOMER_ORDERS_ACTIONS.ordersTabOpened() },
  );
}

describe('customerOrdersReducer', () => {
  describe('pageChange', () => {
    it('returns the same state object when paging values are identical', () => {
      const primed = { ...primedState(), pageIndex: 2, pageSize: 50 };
      const next = customerOrdersReducer(primed, {
        ...CUSTOMER_ORDERS_ACTIONS.pageChange({ pageIndex: 2, pageSize: 50 }),
      });
      expect(next).toBe(primed);
    });

    it('updates on a real change', () => {
      const primed = { ...primedState(), pageIndex: 0, pageSize: 25 };
      const next = customerOrdersReducer(primed, {
        ...CUSTOMER_ORDERS_ACTIONS.pageChange({ pageIndex: 1, pageSize: 25 }),
      });
      expect(next).not.toBe(primed);
      expect(next.pageIndex).toBe(1);
    });
  });

  describe('filtersChange', () => {
    it('returns the same state object when filters already match (orderNumber trimmed)', () => {
      const primed = { ...primedState(), filters: { ...EMPTY_FILTERS, orderNumber: 'ORD-7' } };
      const next = customerOrdersReducer(primed, {
        ...CUSTOMER_ORDERS_ACTIONS.filtersChange({
          filters: { ...EMPTY_FILTERS, orderNumber: '  ORD-7  ' },
        }),
      });
      expect(next).toBe(primed);
    });

    it('resets paging and stores the filters on a real change', () => {
      const primed = { ...primedState(), pageIndex: 4, filters: EMPTY_FILTERS };
      const filters = { ...EMPTY_FILTERS, status: 1 };
      const next = customerOrdersReducer(primed, {
        ...CUSTOMER_ORDERS_ACTIONS.filtersChange({ filters }),
      });
      expect(next.pageIndex).toBe(0);
      expect(next.filters).toEqual(filters);
    });
  });

  describe('filtersClear', () => {
    it('returns the same state object when filters are already empty', () => {
      const primed = { ...primedState(), filters: EMPTY_FILTERS };
      const next = customerOrdersReducer(primed, {
        ...CUSTOMER_ORDERS_ACTIONS.filtersClear(),
      });
      expect(next).toBe(primed);
    });

    it('resets paging and filters on a real clear', () => {
      const primed = {
        ...primedState(),
        pageIndex: 3,
        filters: { ...EMPTY_FILTERS, paymentStatus: 2 },
      };
      const next = customerOrdersReducer(primed, {
        ...CUSTOMER_ORDERS_ACTIONS.filtersClear(),
      });
      expect(next.pageIndex).toBe(0);
      expect(next.filters).toEqual(EMPTY_FILTERS);
    });
  });

  describe('setPagingFromUrl', () => {
    it('applies the paging values and no-ops when nothing changes', () => {
      const primed = { ...primedState(), pageIndex: 2, pageSize: 50 };
      const next = customerOrdersReducer(primed, {
        ...CUSTOMER_ORDERS_ACTIONS.setPagingFromUrl({ pageIndex: 2, pageSize: 50 }),
      });
      expect(next).toBe(primed);
      expect(next.pageIndex).toBe(2);
      expect(next.pageSize).toBe(50);
    });

    it('replaces both paging values from the query', () => {
      const primed = { ...primedState(), pageIndex: 0, pageSize: 25 };
      const next = customerOrdersReducer(primed, {
        ...CUSTOMER_ORDERS_ACTIONS.setPagingFromUrl({ pageIndex: 3, pageSize: 50 }),
      });
      expect(next.pageIndex).toBe(3);
      expect(next.pageSize).toBe(50);
    });
  });

  describe('loadOrders (the state decides whether the API is called)', () => {
    it('stays idle when the tab gate is closed', () => {
      const primed = customerOrdersReducer(CUSTOMER_ORDERS_INITIAL_STATE, {
        ...CUSTOMER_ORDERS_ACTIONS.reset({ customerId: 'cust_1' }),
      });
      const next = customerOrdersReducer(primed, {
        ...CUSTOMER_ORDERS_ACTIONS.loadOrders(),
      });
      expect(next).toBe(primed);
      expect(next.request.status).toBe(LOAD_STATUS.Idle);
    });

    it('stays idle while the customer context is unknown', () => {
      let state = CUSTOMER_ORDERS_INITIAL_STATE;
      state = customerOrdersReducer(state, {
        ...CUSTOMER_ORDERS_ACTIONS.ordersTabOpened(),
      });
      const next = customerOrdersReducer(state, {
        ...CUSTOMER_ORDERS_ACTIONS.loadOrders(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Idle);
    });

    it('starts loading on the first trigger', () => {
      const primed = primedState();
      const next = customerOrdersReducer(primed, {
        ...CUSTOMER_ORDERS_ACTIONS.loadOrders(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
      expect(next.fetchedQuery?.pageIndex).toBe(0);
      expect(next.fetchedQuery?.pageSize).toBe(DEFAULT_ORDERS_PAGE_SIZE);
    });

    it('does not start a second request for the same query once loaded', () => {
      let state = customerOrdersReducer(primedState(), {
        ...CUSTOMER_ORDERS_ACTIONS.loadOrders(),
      });
      state = customerOrdersReducer(state, {
        ...CUSTOMER_ORDERS_ACTIONS.loadOrdersSuccess({
          orders: [],
          info: { length: 0, skip: 0, totalCount: 0 },
        }),
      });
      const next = customerOrdersReducer(state, {
        ...CUSTOMER_ORDERS_ACTIONS.loadOrders(),
      });
      expect(next).toBe(state);
      expect(next.request.status).toBe(LOAD_STATUS.Loaded);
    });

    it('does not restart an in-flight request for the same query', () => {
      let state = customerOrdersReducer(primedState(), {
        ...CUSTOMER_ORDERS_ACTIONS.loadOrders(),
      });
      const next = customerOrdersReducer(state, {
        ...CUSTOMER_ORDERS_ACTIONS.loadOrders(),
      });
      expect(next).toBe(state);
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });

    it('starts a new request when the query actually changed', () => {
      let state = customerOrdersReducer(primedState(), {
        ...CUSTOMER_ORDERS_ACTIONS.loadOrders(),
      });
      state = customerOrdersReducer(state, {
        ...CUSTOMER_ORDERS_ACTIONS.loadOrdersSuccess({
          orders: [],
          info: { length: 0, skip: 0, totalCount: 0 },
        }),
      });
      state = customerOrdersReducer(state, {
        ...CUSTOMER_ORDERS_ACTIONS.pageChange({ pageIndex: 1, pageSize: 25 }),
      });
      const next = customerOrdersReducer(state, {
        ...CUSTOMER_ORDERS_ACTIONS.loadOrders(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
      expect(next.fetchedQuery?.pageIndex).toBe(1);
    });

    it('is re-triggerable for the same query after a failure', () => {
      let state = customerOrdersReducer(primedState(), {
        ...CUSTOMER_ORDERS_ACTIONS.loadOrders(),
      });
      state = customerOrdersReducer(state, {
        ...CUSTOMER_ORDERS_ACTIONS.loadOrdersFailure({ error: new Error('boom') }),
      });
      expect(state.fetchedQuery).toBeNull();
      const next = customerOrdersReducer(state, {
        ...CUSTOMER_ORDERS_ACTIONS.loadOrders(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });
  });
});
