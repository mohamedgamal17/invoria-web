import { describe, expect, it } from 'vitest';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { UiOrder } from '../../models/order-ui.model';
import { OrderStatus } from '../../models/order.entity';
import { PaymentStatus, PaymentType } from '../../models/order-payment.enums';
import { ORDERS_LIST_ACTIONS } from './orders-list.actions';
import {
  ORDERS_LIST_INITIAL_STATE,
  ordersListReducer,
  type OrdersListState,
} from './orders-list.reducer';

const EMPTY_PAGE_INFO = { length: 0, skip: 0, totalCount: 0 };

const ORDER: UiOrder = {
  id: 'ord_1',
  createdAt: '2026-01-01T00:00:00.000Z',
  orderNumber: 'ORD-10001',
  customerName: 'Alice',
  netOfTotalOrderAmount: 100,
  returnsTotal: 0,
  status: OrderStatus.Pending,
  paymentType: PaymentType.Immediate,
  paymentStatus: PaymentStatus.Paid,
  orderDate: '2026-01-01T00:00:00.000Z',
  items: [],
  returnItems: [],
  orderAllocated: false,
};

describe('ordersListReducer', () => {
  describe('setQueryFromUrl', () => {
    it('returns the same state object when the query already matches (order number normalized)', () => {
      const primed: OrdersListState = {
        ...ORDERS_LIST_INITIAL_STATE,
        orderNumberFilter: 'ORD-100',
        statusFilter: OrderStatus.Pending,
      };
      const next = ordersListReducer(primed, {
        ...ORDERS_LIST_ACTIONS.setQueryFromUrl({
          pageIndex: 0,
          pageSize: 25,
          orderNumberFilter: ' ORD-100 ',
          statusFilter: OrderStatus.Pending,
          paymentStatusFilter: null,
          paymentTypeFilter: null,
        }),
      });
      expect(next).toBe(primed);
      expect(next.orderNumberFilter).toBe('ORD-100');
    });

    it('replaces the query values on a real change', () => {
      const next = ordersListReducer(ORDERS_LIST_INITIAL_STATE, {
        ...ORDERS_LIST_ACTIONS.setQueryFromUrl({
          pageIndex: 3,
          pageSize: 50,
          orderNumberFilter: 'ORD-1',
          statusFilter: OrderStatus.Processing,
          paymentStatusFilter: PaymentStatus.Paid,
          paymentTypeFilter: PaymentType.Immediate,
        }),
      });
      expect(next.pageIndex).toBe(3);
      expect(next.pageSize).toBe(50);
      expect(next.orderNumberFilter).toBe('ORD-1');
      expect(next.statusFilter).toBe(OrderStatus.Processing);
      expect(next.paymentStatusFilter).toBe(PaymentStatus.Paid);
      expect(next.paymentTypeFilter).toBe(PaymentType.Immediate);
    });
  });

  describe('loadOrders (the state decides whether the API is called)', () => {
    it('starts loading on the first trigger', () => {
      const next = ordersListReducer(ORDERS_LIST_INITIAL_STATE, {
        ...ORDERS_LIST_ACTIONS.loadOrders(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
      expect(next.fetchedQuery?.pageIndex).toBe(0);
      expect(next.fetchedQuery?.pageSize).toBe(25);
      expect(next.fetchedQuery?.orderNumberFilter).toBe('');
      expect(next.fetchedQuery?.statusFilter).toBeNull();
      expect(next.fetchedQuery?.paymentStatusFilter).toBeNull();
      expect(next.fetchedQuery?.paymentTypeFilter).toBeNull();
    });

    it('does not start a second request for the same query once loaded', () => {
      let state = ordersListReducer(ORDERS_LIST_INITIAL_STATE, {
        ...ORDERS_LIST_ACTIONS.loadOrders(),
      });
      state = ordersListReducer(state, {
        ...ORDERS_LIST_ACTIONS.loadOrdersSuccess({ orders: [], info: EMPTY_PAGE_INFO }),
      });
      const next = ordersListReducer(state, {
        ...ORDERS_LIST_ACTIONS.loadOrders(),
      });
      expect(next).toBe(state);
      expect(next.request.status).toBe(LOAD_STATUS.Loaded);
    });

    it('does not restart an in-flight request for the same query', () => {
      let state = ordersListReducer(ORDERS_LIST_INITIAL_STATE, {
        ...ORDERS_LIST_ACTIONS.loadOrders(),
      });
      const next = ordersListReducer(state, {
        ...ORDERS_LIST_ACTIONS.loadOrders(),
      });
      expect(next).toBe(state);
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });

    it('starts a new request when the query actually changed', () => {
      let state = ordersListReducer(ORDERS_LIST_INITIAL_STATE, {
        ...ORDERS_LIST_ACTIONS.setQueryFromUrl({
          pageIndex: 0,
          pageSize: 25,
          orderNumberFilter: 'ORD-1',
          statusFilter: null,
          paymentStatusFilter: null,
          paymentTypeFilter: null,
        }),
      });
      state = ordersListReducer(state, { ...ORDERS_LIST_ACTIONS.loadOrders() });
      state = ordersListReducer(state, {
        ...ORDERS_LIST_ACTIONS.loadOrdersSuccess({ orders: [], info: EMPTY_PAGE_INFO }),
      });
      state = ordersListReducer(state, {
        ...ORDERS_LIST_ACTIONS.setQueryFromUrl({
          pageIndex: 1,
          pageSize: 25,
          orderNumberFilter: 'ORD-1',
          statusFilter: null,
          paymentStatusFilter: null,
          paymentTypeFilter: null,
        }),
      });
      const next = ordersListReducer(state, {
        ...ORDERS_LIST_ACTIONS.loadOrders(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
      expect(next.fetchedQuery?.pageIndex).toBe(1);
    });

    it('starts a new request when only a payment filter changed', () => {
      let state = ordersListReducer(ORDERS_LIST_INITIAL_STATE, {
        ...ORDERS_LIST_ACTIONS.loadOrders(),
      });
      state = ordersListReducer(state, {
        ...ORDERS_LIST_ACTIONS.loadOrdersSuccess({ orders: [], info: EMPTY_PAGE_INFO }),
      });
      state = ordersListReducer(state, {
        ...ORDERS_LIST_ACTIONS.setQueryFromUrl({
          pageIndex: 0,
          pageSize: 25,
          orderNumberFilter: '',
          statusFilter: null,
          paymentStatusFilter: PaymentStatus.Paid,
          paymentTypeFilter: null,
        }),
      });
      const next = ordersListReducer(state, {
        ...ORDERS_LIST_ACTIONS.loadOrders(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
      expect(next.fetchedQuery?.paymentStatusFilter).toBe(PaymentStatus.Paid);
    });

    it('is re-triggerable for the same query after a failure', () => {
      let state = ordersListReducer(ORDERS_LIST_INITIAL_STATE, {
        ...ORDERS_LIST_ACTIONS.loadOrders(),
      });
      state = ordersListReducer(state, {
        ...ORDERS_LIST_ACTIONS.loadOrdersFailure({ error: new Error('boom') }),
      });
      expect(state.fetchedQuery).toBeNull();
      expect(state.request.status).toBe(LOAD_STATUS.Error);
      const next = ordersListReducer(state, {
        ...ORDERS_LIST_ACTIONS.loadOrders(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });
  });

  describe('loadOrdersSuccess', () => {
    it('stores orders and paging info and clears the error', () => {
      let state = ordersListReducer(ORDERS_LIST_INITIAL_STATE, {
        ...ORDERS_LIST_ACTIONS.loadOrdersFailure({ error: new Error('boom') }),
      });
      const next = ordersListReducer(state, {
        ...ORDERS_LIST_ACTIONS.loadOrdersSuccess({
          orders: [ORDER],
          info: { length: 25, skip: 0, totalCount: 1 },
        }),
      });
      expect(next.orders).toHaveLength(1);
      expect(next.info?.totalCount).toBe(1);
      expect(next.request.status).toBe(LOAD_STATUS.Loaded);
      expect(next.request.error).toBeNull();
    });
  });

  describe('loadOrdersFailure', () => {
    it('clears the list, paging info and fetched query', () => {
      let state = ordersListReducer(ORDERS_LIST_INITIAL_STATE, {
        ...ORDERS_LIST_ACTIONS.loadOrders(),
      });
      state = ordersListReducer(state, {
        ...ORDERS_LIST_ACTIONS.loadOrdersSuccess({
          orders: [ORDER],
          info: { length: 25, skip: 0, totalCount: 1 },
        }),
      });
      const next = ordersListReducer(state, {
        ...ORDERS_LIST_ACTIONS.loadOrdersFailure({ error: new Error('boom') }),
      });
      expect(next.orders).toEqual([]);
      expect(next.info).toBeNull();
      expect(next.fetchedQuery).toBeNull();
      expect(next.request.status).toBe(LOAD_STATUS.Error);
    });
  });

  describe('orderCreated (local sync, no refetch)', () => {
    const NEW_ORDER: UiOrder = {
      ...ORDER,
      id: 'ord_2',
      orderNumber: 'ORD-10002',
    };

    function loadedState(overrides: Partial<OrdersListState> = {}): OrdersListState {
      let state = ordersListReducer(ORDERS_LIST_INITIAL_STATE, {
        ...ORDERS_LIST_ACTIONS.loadOrders(),
      });
      state = ordersListReducer(state, {
        ...ORDERS_LIST_ACTIONS.loadOrdersSuccess({
          orders: [ORDER],
          info: { length: 1, skip: 0, totalCount: 1 },
        }),
      });
      return { ...state, ...overrides };
    }

    it('prepends on top on the first page and silently bumps totalCount', () => {
      const state = loadedState();
      const next = ordersListReducer(state, {
        ...ORDERS_LIST_ACTIONS.orderCreated({ order: NEW_ORDER }),
      });
      expect(next.orders.map((order) => order.id)).toEqual(['ord_2', 'ord_1']);
      expect(next.info?.totalCount).toBe(2);
      expect(next.info?.length).toBe(2);
      expect(next.request).toBe(state.request);
      expect(next.fetchedQuery).toBe(state.fetchedQuery);
    });

    it('trims to pageSize when the page is full', () => {
      const full = Array.from(
        { length: 25 },
        (_, index) => ({ ...ORDER, id: `ord_full_${index}` }),
      );
      const state = loadedState({
        orders: full,
        info: { length: 25, skip: 0, totalCount: 25 },
      });
      const next = ordersListReducer(state, {
        ...ORDERS_LIST_ACTIONS.orderCreated({ order: NEW_ORDER }),
      });
      expect(next.orders).toHaveLength(25);
      expect(next.orders[0].id).toBe('ord_2');
      expect(next.orders.some((order) => order.id === 'ord_full_24')).toBe(false);
      expect(next.info?.totalCount).toBe(26);
      expect(next.info?.length).toBe(25);
    });

    it('only bumps totalCount when not on the first page', () => {
      const state = loadedState({ pageIndex: 1 });
      const next = ordersListReducer(state, {
        ...ORDERS_LIST_ACTIONS.orderCreated({ order: NEW_ORDER }),
      });
      expect(next.orders).toBe(state.orders);
      expect(next.info?.totalCount).toBe(2);
    });

    it('only bumps totalCount when the order number does not match the filter', () => {
      const state = loadedState({ orderNumberFilter: 'ORD-10001' });
      const next = ordersListReducer(state, {
        ...ORDERS_LIST_ACTIONS.orderCreated({ order: NEW_ORDER }),
      });
      expect(next.orders).toBe(state.orders);
      expect(next.info?.totalCount).toBe(2);
    });

    it('prepends when the order number matches the filter (case-insensitive)', () => {
      const state = loadedState({ orderNumberFilter: 'ord-10002' });
      const next = ordersListReducer(state, {
        ...ORDERS_LIST_ACTIONS.orderCreated({ order: NEW_ORDER }),
      });
      expect(next.orders[0].id).toBe('ord_2');
    });

    it('returns the same state when the page was never loaded', () => {
      const next = ordersListReducer(ORDERS_LIST_INITIAL_STATE, {
        ...ORDERS_LIST_ACTIONS.orderCreated({ order: NEW_ORDER }),
      });
      expect(next).toBe(ORDERS_LIST_INITIAL_STATE);
    });

    it('returns the same state for a duplicate order id', () => {
      const state = loadedState();
      const next = ordersListReducer(state, {
        ...ORDERS_LIST_ACTIONS.orderCreated({ order: ORDER }),
      });
      expect(next).toBe(state);
    });
  });

  describe.each([
    ['orderAccepted', ORDERS_LIST_ACTIONS.orderAccepted],
    ['orderRevisionRequested', ORDERS_LIST_ACTIONS.orderRevisionRequested],
    ['orderCompleted', ORDERS_LIST_ACTIONS.orderCompleted],
    ['orderCancelled', ORDERS_LIST_ACTIONS.orderCancelled],
    ['orderUpdated', ORDERS_LIST_ACTIONS.orderUpdated],
  ] as const)('%s (local sync, no refetch)', (_name, action) => {
    const UPDATED_ORDER: UiOrder = {
      ...ORDER,
      status: OrderStatus.Completed,
      amountDue: 0,
    };

    function loadedState(): OrdersListState {
      let state = ordersListReducer(ORDERS_LIST_INITIAL_STATE, {
        ...ORDERS_LIST_ACTIONS.loadOrders(),
      });
      state = ordersListReducer(state, {
        ...ORDERS_LIST_ACTIONS.loadOrdersSuccess({
          orders: [ORDER],
          info: { length: 1, skip: 0, totalCount: 1 },
        }),
      });
      return state;
    }

    it('replaces the order in place when it is on the current page', () => {
      const state = loadedState();
      const next = ordersListReducer(state, action({ order: UPDATED_ORDER }));
      expect(next.orders).toEqual([UPDATED_ORDER]);
      expect(next.info?.totalCount).toBe(1);
      expect(next.request).toBe(state.request);
      expect(next.fetchedQuery).toBe(state.fetchedQuery);
    });

    it('returns the same state when the order is not on the current page', () => {
      const state = loadedState();
      const other: UiOrder = { ...UPDATED_ORDER, id: 'ord_other' };
      const next = ordersListReducer(state, action({ order: other }));
      expect(next).toBe(state);
    });

    it('returns the same state when the page was never loaded', () => {
      const next = ordersListReducer(ORDERS_LIST_INITIAL_STATE, action({ order: UPDATED_ORDER }));
      expect(next).toBe(ORDERS_LIST_INITIAL_STATE);
    });
  });
});
