import { createFeature, createReducer, on } from '@ngrx/store';

import type { PagingInfo } from '../../../../core/models/paging';
import {
  INITIAL_ASYNC_REQUEST_STATE,
  applyFailure,
  startLoading,
  type AsyncRequestState,
} from '../../../../shared/models/async-request-state';
import type { PurchaseOrder } from '../../models/purchase-order.entity';
import { PURCHASE_ORDERS_LIST_ACTIONS } from './purchase-orders-list.actions';

export const PURCHASE_ORDERS_LIST_FEATURE_KEY = 'purchaseOrdersList';

export interface PurchaseOrdersListState {
  /** 0-based page index, observed from the `page` query param (1-based there). */
  pageIndex: number;
  /** Page size, observed from the `pageSize` query param. */
  pageSize: number;
  /** Normalized purchase order number filter, observed from the `number` query param. */
  numberFilter: string;
  /** Validated `PurchaseState` filter, observed from the `status` query param. */
  statusFilter: number | null;
  /** The exact fetch identity (normalized) behind the current data — in-flight or loaded. */
  fetchedQuery: PurchaseOrdersListQuery | null;
  /** Purchase orders for the CURRENT api page. */
  purchaseOrders: PurchaseOrder[];
  /** API paging details of the current page. */
  info: PagingInfo | null;
  request: AsyncRequestState;
}

/** Normalized identifier of one purchase-orders fetch: paging plus the number/status filters. */
export interface PurchaseOrdersListQuery {
  pageIndex: number;
  pageSize: number;
  numberFilter: string;
  statusFilter: number | null;
}

/** Builds the fetch identity from the current state. */
function queryFromState(state: PurchaseOrdersListState): PurchaseOrdersListQuery {
  return {
    pageIndex: state.pageIndex,
    pageSize: state.pageSize,
    numberFilter: state.numberFilter,
    statusFilter: state.statusFilter,
  };
}

export function sameQuery(
  left: PurchaseOrdersListQuery | null,
  right: PurchaseOrdersListQuery,
): boolean {
  return (
    left !== null &&
    left.pageIndex === right.pageIndex &&
    left.pageSize === right.pageSize &&
    left.numberFilter === right.numberFilter &&
    left.statusFilter === right.statusFilter
  );
}

export const PURCHASE_ORDERS_LIST_INITIAL_STATE: PurchaseOrdersListState = {
  pageIndex: 0,
  pageSize: 25,
  numberFilter: '',
  statusFilter: null,
  fetchedQuery: null,
  purchaseOrders: [],
  info: null,
  request: INITIAL_ASYNC_REQUEST_STATE,
};

export const purchaseOrdersListReducer = createReducer(
  PURCHASE_ORDERS_LIST_INITIAL_STATE,

  on(PURCHASE_ORDERS_LIST_ACTIONS.setQueryFromUrl, (state, payload) => {
    const normalizedFilter = payload.numberFilter.trim();
    if (
      payload.pageIndex === state.pageIndex &&
      payload.pageSize === state.pageSize &&
      normalizedFilter === state.numberFilter &&
      payload.statusFilter === state.statusFilter
    ) {
      return state;
    }
    return {
      ...state,
      pageIndex: payload.pageIndex,
      pageSize: payload.pageSize,
      numberFilter: normalizedFilter,
      statusFilter: payload.statusFilter,
    };
  }),

  // The state decides whether a real request is needed: the fetch may only go
  // in flight when the query differs from the one being fetched/loaded.
  on(PURCHASE_ORDERS_LIST_ACTIONS.loadPurchaseOrders, (state) => {
    const query = queryFromState(state);
    if (sameQuery(state.fetchedQuery, query)) {
      return state;
    }
    return { ...state, request: startLoading(state.request), fetchedQuery: query };
  }),

  on(PURCHASE_ORDERS_LIST_ACTIONS.loadPurchaseOrdersSuccess, (state, { purchaseOrders, info }) => ({
    ...state,
    purchaseOrders,
    info,
    request: { ...state.request, status: 'loaded' as const, error: null },
  })),

  on(PURCHASE_ORDERS_LIST_ACTIONS.loadPurchaseOrdersFailure, (state, { error }) => ({
    ...state,
    purchaseOrders: [],
    info: null,
    fetchedQuery: null,
    request: applyFailure(state.request, error),
  })),

  // Local mutation sync: replace the current purchase order in place if it is on
  // the current page (e.g. a state transition from the details page); otherwise
  // ignore it — the next real fetch will include it. Never changes totalCount.
  on(PURCHASE_ORDERS_LIST_ACTIONS.purchaseOrderUpdated, (state, { purchaseOrder }) => {
    if (state.info === null) {
      return state;
    }
    if (!state.purchaseOrders.some((item) => item.id === purchaseOrder.id)) {
      return state;
    }
    return {
      ...state,
      purchaseOrders: state.purchaseOrders.map((item) =>
        item.id === purchaseOrder.id ? purchaseOrder : item,
      ),
    };
  }),
);

export const purchaseOrdersListFeature = createFeature({
  name: PURCHASE_ORDERS_LIST_FEATURE_KEY,
  reducer: purchaseOrdersListReducer,
});
