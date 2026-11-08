import { createFeature, createReducer, on } from '@ngrx/store';

import type { PagingInfo } from '../../../../core/models/paging';
import {
  INITIAL_ASYNC_REQUEST_STATE,
  applyFailure,
  startLoading,
  type AsyncRequestState,
} from '../../../../shared/models/async-request-state';
import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { OrdersListFilters } from '../../../orders/components/orders-filter-panel/orders-filter-panel.component';
import type { UiOrder } from '../../../orders/models/order-ui.model';
import { CUSTOMER_ORDERS_ACTIONS } from './customer-details-orders.actions';

export const CUSTOMER_ORDERS_FEATURE_KEY = 'customerDetailsOrders';

export const DEFAULT_ORDERS_PAGE_SIZE = 25;

export interface CustomerOrdersState {
  customerId: string;
  /** `false` keeps the fetch idle — orders load only after the Orders tab opens. */
  ordersTabOpened: boolean;
  /** 0-based page index, observed from the `page` query param. */
  pageIndex: number;
  /** Page size, observed from the `rows` query param. */
  pageSize: number;
  filters: OrdersListFilters;
  /** The exact query (normalized) behind the current data — in-flight or loaded. */
  fetchedQuery: CustomerOrdersQuery | null;
  /** Orders for the CURRENT api pagination. */
  orders: UiOrder[];
  /** API paging details of the current page. */
  info: PagingInfo | null;
  request: AsyncRequestState;
}

/** Normalized identifier of one orders fetch: paging plus filters. */
export interface CustomerOrdersQuery {
  pageIndex: number;
  pageSize: number;
  filters: OrdersListFilters;
}

/** Builds the fetch identity from the current state; `orderNumber` is trimmed so plain equality works. */
function queryFromState(state: CustomerOrdersState): CustomerOrdersQuery {
  return {
    pageIndex: state.pageIndex,
    pageSize: state.pageSize,
    filters: { ...state.filters, orderNumber: state.filters.orderNumber.trim() },
  };
}

export function sameFilters(left: OrdersListFilters, right: OrdersListFilters): boolean {
  return (
    left.orderNumber.trim() === right.orderNumber.trim() &&
    left.status === right.status &&
    left.paymentStatus === right.paymentStatus &&
    left.paymentType === right.paymentType
  );
}

export function sameQuery(left: CustomerOrdersQuery | null, right: CustomerOrdersQuery): boolean {
  return (
    left !== null &&
    left.pageIndex === right.pageIndex &&
    left.pageSize === right.pageSize &&
    sameFilters(left.filters, right.filters)
  );
}

export function isFiltersEmpty(filters: OrdersListFilters): boolean {
  return (
    !filters.orderNumber.trim() &&
    filters.status == null &&
    filters.paymentStatus == null &&
    filters.paymentType == null
  );
}

export const CUSTOMER_ORDERS_INITIAL_STATE: CustomerOrdersState = {
  customerId: '',
  ordersTabOpened: false,
  pageIndex: 0,
  pageSize: DEFAULT_ORDERS_PAGE_SIZE,
  filters: { orderNumber: '', status: null, paymentStatus: null, paymentType: null },
  fetchedQuery: null,
  orders: [],
  info: null,
  request: INITIAL_ASYNC_REQUEST_STATE,
};

export const customerOrdersReducer = createReducer(
  CUSTOMER_ORDERS_INITIAL_STATE,

  on(CUSTOMER_ORDERS_ACTIONS.ordersTabOpened, (state) =>
    state.ordersTabOpened ? state : { ...state, ordersTabOpened: true },
  ),

  on(CUSTOMER_ORDERS_ACTIONS.setPagingFromUrl, (state, { pageIndex, pageSize }) => {
    if (pageIndex === state.pageIndex && pageSize === state.pageSize) {
      return state;
    }
    return { ...state, pageIndex, pageSize };
  }),

  on(CUSTOMER_ORDERS_ACTIONS.pageChange, (state, { pageIndex, pageSize }) =>
    pageIndex === state.pageIndex && pageSize === state.pageSize
      ? state
      : { ...state, pageIndex, pageSize },
  ),

  on(CUSTOMER_ORDERS_ACTIONS.filtersChange, (state, { filters }) =>
    state.pageIndex === 0 && sameFilters(state.filters, filters)
      ? state
      : { ...state, pageIndex: 0, filters: { ...filters } },
  ),

  on(CUSTOMER_ORDERS_ACTIONS.filtersClear, (state) =>
    isFiltersEmpty(state.filters) && state.pageIndex === 0
      ? state
      : {
          ...state,
          pageIndex: 0,
          filters: { orderNumber: '', status: null, paymentStatus: null, paymentType: null },
        },
  ),

  // The state decides whether a real request is needed: the fetch may only go
  // in flight when the tab gate is open and the owning customer context is
  // known, and only when the query differs from the one being fetched/loaded.
  on(CUSTOMER_ORDERS_ACTIONS.loadOrders, (state) => {
    if (!state.ordersTabOpened || !state.customerId) {
      return state;
    }
    const query = queryFromState(state);
    if (sameQuery(state.fetchedQuery, query)) {
      return state;
    }
    return { ...state, request: startLoading(state.request), fetchedQuery: query };
  }),

  on(CUSTOMER_ORDERS_ACTIONS.loadOrdersSuccess, (state, { orders, info }) => ({
    ...state,
    orders,
    info,
    request: { ...state.request, status: LOAD_STATUS.Loaded, error: null },
  })),

  on(CUSTOMER_ORDERS_ACTIONS.loadOrdersFailure, (state, { error }) => ({
    ...state,
    orders: [],
    info: null,
    fetchedQuery: null,
    request: applyFailure(state.request, error),
  })),

  on(CUSTOMER_ORDERS_ACTIONS.reset, (state, { customerId }) => ({
    ...CUSTOMER_ORDERS_INITIAL_STATE,
    customerId,
  })),
);

export const customerOrdersFeature = createFeature({
  name: CUSTOMER_ORDERS_FEATURE_KEY,
  reducer: customerOrdersReducer,
});
