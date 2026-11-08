import { createFeature, createReducer, on } from '@ngrx/store';

import type { PagingInfo } from '../../../../core/models/paging';
import {
  INITIAL_ASYNC_REQUEST_STATE,
  applyFailure,
  startLoading,
  type AsyncRequestState,
} from '../../../../shared/models/async-request-state';
import type { UiOrder } from '../../models/order-ui.model';
import { ORDERS_LIST_ACTIONS } from './orders-list.actions';

export const ORDERS_LIST_FEATURE_KEY = 'ordersList';

export interface OrdersListState {
  /** 0-based page index, observed from the `page` query param (1-based there). */
  pageIndex: number;
  /** Page size, observed from the `pageSize` query param. */
  pageSize: number;
  /** Normalized order-number filter, observed from the `q` query param. */
  orderNumberFilter: string;
  /** `OrderStatus` filter, observed from the `status` query param (`null` = all). */
  statusFilter: number | null;
  /** Payment status filter, observed from the `paymentStatus` query param (`null` = all). */
  paymentStatusFilter: number | null;
  /** Payment type filter, observed from the `paymentType` query param (`null` = all). */
  paymentTypeFilter: number | null;
  /** The exact fetch identity (normalized) behind the current data — in-flight or loaded. */
  fetchedQuery: OrdersListQuery | null;
  /** Orders for the CURRENT api page (UI-ready). */
  orders: UiOrder[];
  /** API paging details of the current page. */
  info: PagingInfo | null;
  request: AsyncRequestState;
}

/** Normalized identifier of one orders fetch: paging plus every active filter. */
export interface OrdersListQuery {
  pageIndex: number;
  pageSize: number;
  orderNumberFilter: string;
  statusFilter: number | null;
  paymentStatusFilter: number | null;
  paymentTypeFilter: number | null;
}

/** Builds the fetch identity from the current state. */
function queryFromState(state: OrdersListState): OrdersListQuery {
  return {
    pageIndex: state.pageIndex,
    pageSize: state.pageSize,
    orderNumberFilter: state.orderNumberFilter,
    statusFilter: state.statusFilter,
    paymentStatusFilter: state.paymentStatusFilter,
    paymentTypeFilter: state.paymentTypeFilter,
  };
}

export function sameQuery(left: OrdersListQuery | null, right: OrdersListQuery): boolean {
  return (
    left !== null &&
    left.pageIndex === right.pageIndex &&
    left.pageSize === right.pageSize &&
    left.orderNumberFilter === right.orderNumberFilter &&
    left.statusFilter === right.statusFilter &&
    left.paymentStatusFilter === right.paymentStatusFilter &&
    left.paymentTypeFilter === right.paymentTypeFilter
  );
}

export const ORDERS_LIST_INITIAL_STATE: OrdersListState = {
  pageIndex: 0,
  pageSize: 25,
  orderNumberFilter: '',
  statusFilter: null,
  paymentStatusFilter: null,
  paymentTypeFilter: null,
  fetchedQuery: null,
  orders: [],
  info: null,
  request: INITIAL_ASYNC_REQUEST_STATE,
};

export const ordersListReducer = createReducer(
  ORDERS_LIST_INITIAL_STATE,

  on(ORDERS_LIST_ACTIONS.setQueryFromUrl, (state, action) => {
    const { pageIndex, pageSize, statusFilter, paymentStatusFilter, paymentTypeFilter } = action;
    const orderNumberFilter = action.orderNumberFilter.trim();
    if (
      pageIndex === state.pageIndex &&
      pageSize === state.pageSize &&
      orderNumberFilter === state.orderNumberFilter &&
      statusFilter === state.statusFilter &&
      paymentStatusFilter === state.paymentStatusFilter &&
      paymentTypeFilter === state.paymentTypeFilter
    ) {
      return state;
    }
    return {
      ...state,
      pageIndex,
      pageSize,
      orderNumberFilter,
      statusFilter,
      paymentStatusFilter,
      paymentTypeFilter,
    };
  }),

  // The state decides whether a real request is needed: the fetch may only go
  // in flight when the query differs from the one being fetched/loaded.
  on(ORDERS_LIST_ACTIONS.loadOrders, (state) => {
    const query = queryFromState(state);
    if (sameQuery(state.fetchedQuery, query)) {
      return state;
    }
    return { ...state, request: startLoading(state.request), fetchedQuery: query };
  }),

  on(ORDERS_LIST_ACTIONS.loadOrdersSuccess, (state, { orders, info }) => ({
    ...state,
    orders,
    info,
    request: { ...state.request, status: 'loaded' as const, error: null },
  })),

  on(ORDERS_LIST_ACTIONS.loadOrdersFailure, (state, { error }) => ({
    ...state,
    orders: [],
    info: null,
    fetchedQuery: null,
    request: applyFailure(state.request, error),
  })),

  // Local mutation sync: prepend a newly created order on top of the current
  // page without refetching. Only visible on the first page when the order
  // number matches the active filter; the paging total is always bumped silently.
  on(ORDERS_LIST_ACTIONS.orderCreated, (state, { order }) => {
    if (state.info === null || state.fetchedQuery === null) {
      return state;
    }
    if (state.orders.some((item) => item.id === order.id)) {
      return state;
    }
    const matchesFilter =
      !state.orderNumberFilter ||
      order.orderNumber.toLowerCase().includes(state.orderNumberFilter.toLowerCase());
    const shouldPrepend = state.pageIndex === 0 && matchesFilter;
    const orders = shouldPrepend
      ? [order, ...state.orders].slice(0, state.pageSize)
      : state.orders;
    return {
      ...state,
      orders,
      info: {
        ...state.info,
        totalCount: state.info.totalCount + 1,
        length: Math.min(orders.length, state.pageSize),
      },
    };
  }),

  // Local mutation sync: replace the current order in place if it is on the
  // current page; otherwise ignore it (the next fetch will include it).
  // Shared by every transition and the general-purpose direct-API update.
  on(
    ORDERS_LIST_ACTIONS.orderAccepted,
    ORDERS_LIST_ACTIONS.orderRevisionRequested,
    ORDERS_LIST_ACTIONS.orderCompleted,
    ORDERS_LIST_ACTIONS.orderCancelled,
    ORDERS_LIST_ACTIONS.orderUpdated,
    (state, { order }) => {
      if (state.info === null) {
        return state;
      }
      if (!state.orders.some((item) => item.id === order.id)) {
        return state;
      }
      return {
        ...state,
        orders: state.orders.map((item) => (item.id === order.id ? order : item)),
      };
    },
  ),
);

export const ordersListFeature = createFeature({
  name: ORDERS_LIST_FEATURE_KEY,
  reducer: ordersListReducer,
});
