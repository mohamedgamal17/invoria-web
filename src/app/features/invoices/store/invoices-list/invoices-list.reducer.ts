import { createFeature, createReducer, on } from '@ngrx/store';

import type { PagingInfo } from '../../../../core/models/paging';
import {
  INITIAL_ASYNC_REQUEST_STATE,
  applyFailure,
  startLoading,
  type AsyncRequestState,
} from '../../../../shared/models/async-request-state';
import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { Invoice } from '../../models/invoice.entity';
import { INVOICES_LIST_ACTIONS } from './invoices-list.actions';

export const INVOICES_LIST_FEATURE_KEY = 'invoicesList';

export interface InvoicesListState {
  /** 0-based page index, observed from the `page` query param (1-based there). */
  pageIndex: number;
  /** Page size, observed from the `pageSize` query param. */
  pageSize: number;
  /** Normalized customer filter, observed from the `customerId` query param. */
  customerIdFilter: string;
  /** Normalized order filter, observed from the `orderId` query param. */
  orderIdFilter: string;
  /** The exact fetch identity (normalized) behind the current data — in-flight or loaded. */
  fetchedQuery: InvoicesListQuery | null;
  /** Invoices for the CURRENT api page. */
  invoices: Invoice[];
  /** API paging details of the current page. */
  info: PagingInfo | null;
  request: AsyncRequestState;
}

/** Normalized identifier of one invoices fetch: paging plus both entity filters. */
export interface InvoicesListQuery {
  pageIndex: number;
  pageSize: number;
  customerIdFilter: string;
  orderIdFilter: string;
}

/** Builds the fetch identity from the current state. */
function queryFromState(state: InvoicesListState): InvoicesListQuery {
  return {
    pageIndex: state.pageIndex,
    pageSize: state.pageSize,
    customerIdFilter: state.customerIdFilter,
    orderIdFilter: state.orderIdFilter,
  };
}

export function sameQuery(
  left: InvoicesListQuery | null,
  right: InvoicesListQuery,
): boolean {
  return (
    left !== null &&
    left.pageIndex === right.pageIndex &&
    left.pageSize === right.pageSize &&
    left.customerIdFilter === right.customerIdFilter &&
    left.orderIdFilter === right.orderIdFilter
  );
}

export const INVOICES_LIST_INITIAL_STATE: InvoicesListState = {
  pageIndex: 0,
  pageSize: 25,
  customerIdFilter: '',
  orderIdFilter: '',
  fetchedQuery: null,
  invoices: [],
  info: null,
  request: INITIAL_ASYNC_REQUEST_STATE,
};

export const invoicesListReducer = createReducer(
  INVOICES_LIST_INITIAL_STATE,

  on(
    INVOICES_LIST_ACTIONS.setQueryFromUrl,
    (state, { pageIndex, pageSize, customerIdFilter, orderIdFilter }) => {
      const normalizedCustomerId = customerIdFilter.trim();
      const normalizedOrderId = orderIdFilter.trim();
      if (
        pageIndex === state.pageIndex &&
        pageSize === state.pageSize &&
        normalizedCustomerId === state.customerIdFilter &&
        normalizedOrderId === state.orderIdFilter
      ) {
        return state;
      }
      return {
        ...state,
        pageIndex,
        pageSize,
        customerIdFilter: normalizedCustomerId,
        orderIdFilter: normalizedOrderId,
      };
    },
  ),

  // The state decides whether a real request is needed: the fetch may only go
  // in flight when the query differs from the one being fetched/loaded.
  on(INVOICES_LIST_ACTIONS.loadInvoices, (state) => {
    const query = queryFromState(state);
    if (sameQuery(state.fetchedQuery, query)) {
      return state;
    }
    return { ...state, request: startLoading(state.request), fetchedQuery: query };
  }),

  on(INVOICES_LIST_ACTIONS.loadInvoicesSuccess, (state, { invoices, info }) => ({
    ...state,
    invoices,
    info,
    request: { ...state.request, status: LOAD_STATUS.Loaded, error: null },
  })),

  on(INVOICES_LIST_ACTIONS.loadInvoicesFailure, (state, { error }) => ({
    ...state,
    invoices: [],
    info: null,
    fetchedQuery: null,
    request: applyFailure(state.request, error),
  })),
);

export const invoicesListFeature = createFeature({
  name: INVOICES_LIST_FEATURE_KEY,
  reducer: invoicesListReducer,
});
