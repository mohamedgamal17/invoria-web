import { createFeature, createReducer, on } from '@ngrx/store';

import type { PagingInfo } from '../../../../core/models/paging';
import {
  INITIAL_ASYNC_REQUEST_STATE,
  applyFailure,
  startLoading,
  type AsyncRequestState,
} from '../../../../shared/models/async-request-state';
import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { PurchaseOrdersListFilters } from '../../../procurement/components/purchase-orders-filter-panel/purchase-orders-filter-panel.component';
import type { PurchaseOrder } from '../../../procurement/models/purchase-order.entity';
import { SUPPLIER_PURCHASE_ORDERS_ACTIONS } from './supplier-details-purchase-orders.actions';

export const SUPPLIER_PURCHASE_ORDERS_FEATURE_KEY = 'supplierDetailsPurchaseOrders';

export const DEFAULT_PURCHASE_ORDERS_PAGE_SIZE = 25;

export interface SupplierPurchaseOrdersState {
  supplierId: string;
  /** `false` keeps the fetch idle — purchase orders load only after the Purchase Orders tab opens. */
  purchaseOrdersTabOpened: boolean;
  /** 0-based page index, observed from the `page` query param. */
  pageIndex: number;
  /** Page size, observed from the `rows` query param. */
  pageSize: number;
  filters: PurchaseOrdersListFilters;
  /** The exact query (normalized) behind the current data — in-flight or loaded. */
  fetchedQuery: SupplierPurchaseOrdersQuery | null;
  /** Purchase orders for the CURRENT api pagination. */
  purchaseOrders: PurchaseOrder[];
  /** API paging details of the current page. */
  info: PagingInfo | null;
  request: AsyncRequestState;
}

/** Normalized identifier of one purchase orders fetch: paging plus filters. */
export interface SupplierPurchaseOrdersQuery {
  pageIndex: number;
  pageSize: number;
  filters: PurchaseOrdersListFilters;
}

/** Builds the fetch identity from the current state; `purchaseNumber` is trimmed so plain equality works. */
function queryFromState(state: SupplierPurchaseOrdersState): SupplierPurchaseOrdersQuery {
  return {
    pageIndex: state.pageIndex,
    pageSize: state.pageSize,
    filters: { ...state.filters, purchaseNumber: state.filters.purchaseNumber.trim() },
  };
}

export function sameFilters(
  left: PurchaseOrdersListFilters,
  right: PurchaseOrdersListFilters,
): boolean {
  return left.purchaseNumber.trim() === right.purchaseNumber.trim() && left.status === right.status;
}

export function sameQuery(
  left: SupplierPurchaseOrdersQuery | null,
  right: SupplierPurchaseOrdersQuery,
): boolean {
  return (
    left !== null &&
    left.pageIndex === right.pageIndex &&
    left.pageSize === right.pageSize &&
    sameFilters(left.filters, right.filters)
  );
}

export function isFiltersEmpty(filters: PurchaseOrdersListFilters): boolean {
  return !filters.purchaseNumber.trim() && filters.status == null;
}

export const SUPPLIER_PURCHASE_ORDERS_INITIAL_STATE: SupplierPurchaseOrdersState = {
  supplierId: '',
  purchaseOrdersTabOpened: false,
  pageIndex: 0,
  pageSize: DEFAULT_PURCHASE_ORDERS_PAGE_SIZE,
  filters: { purchaseNumber: '', status: null },
  fetchedQuery: null,
  purchaseOrders: [],
  info: null,
  request: INITIAL_ASYNC_REQUEST_STATE,
};

export const supplierPurchaseOrdersReducer = createReducer(
  SUPPLIER_PURCHASE_ORDERS_INITIAL_STATE,

  on(SUPPLIER_PURCHASE_ORDERS_ACTIONS.purchaseOrdersTabOpened, (state) =>
    state.purchaseOrdersTabOpened ? state : { ...state, purchaseOrdersTabOpened: true },
  ),

  on(SUPPLIER_PURCHASE_ORDERS_ACTIONS.setPagingFromUrl, (state, { pageIndex, pageSize }) => {
    if (pageIndex === state.pageIndex && pageSize === state.pageSize) {
      return state;
    }
    return { ...state, pageIndex, pageSize };
  }),

  on(SUPPLIER_PURCHASE_ORDERS_ACTIONS.pageChange, (state, { pageIndex, pageSize }) =>
    pageIndex === state.pageIndex && pageSize === state.pageSize
      ? state
      : { ...state, pageIndex, pageSize },
  ),

  on(SUPPLIER_PURCHASE_ORDERS_ACTIONS.filtersChange, (state, { filters }) =>
    state.pageIndex === 0 && sameFilters(state.filters, filters)
      ? state
      : { ...state, pageIndex: 0, filters: { ...filters } },
  ),

  on(SUPPLIER_PURCHASE_ORDERS_ACTIONS.filtersClear, (state) =>
    isFiltersEmpty(state.filters) && state.pageIndex === 0
      ? state
      : {
          ...state,
          pageIndex: 0,
          filters: { purchaseNumber: '', status: null },
        },
  ),

  // The state decides whether a real request is needed: the fetch may only go
  // in flight when the tab gate is open and the owning supplier context is
  // known, and only when the query differs from the one being fetched/loaded.
  on(SUPPLIER_PURCHASE_ORDERS_ACTIONS.loadPurchaseOrders, (state) => {
    if (!state.purchaseOrdersTabOpened || !state.supplierId) {
      return state;
    }
    const query = queryFromState(state);
    if (sameQuery(state.fetchedQuery, query)) {
      return state;
    }
    return { ...state, request: startLoading(state.request), fetchedQuery: query };
  }),

  on(
    SUPPLIER_PURCHASE_ORDERS_ACTIONS.loadPurchaseOrdersSuccess,
    (state, { purchaseOrders, info }) => ({
      ...state,
      purchaseOrders,
      info,
      request: { ...state.request, status: LOAD_STATUS.Loaded, error: null },
    }),
  ),

  on(SUPPLIER_PURCHASE_ORDERS_ACTIONS.loadPurchaseOrdersFailure, (state, { error }) => ({
    ...state,
    purchaseOrders: [],
    info: null,
    fetchedQuery: null,
    request: applyFailure(state.request, error),
  })),

  on(SUPPLIER_PURCHASE_ORDERS_ACTIONS.reset, (state, { supplierId }) => ({
    ...SUPPLIER_PURCHASE_ORDERS_INITIAL_STATE,
    supplierId,
  })),
);

export const supplierPurchaseOrdersFeature = createFeature({
  name: SUPPLIER_PURCHASE_ORDERS_FEATURE_KEY,
  reducer: supplierPurchaseOrdersReducer,
});
