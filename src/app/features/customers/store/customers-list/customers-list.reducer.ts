import { createFeature, createReducer, on } from '@ngrx/store';

import type { PagingInfo } from '../../../../core/models/paging';
import {
  INITIAL_ASYNC_REQUEST_STATE,
  applyFailure,
  startLoading,
  type AsyncRequestState,
} from '../../../../shared/models/async-request-state';
import type { Customer } from '../../models/customer.entity';
import { CUSTOMERS_LIST_ACTIONS } from './customers-list.actions';

export const CUSTOMERS_LIST_FEATURE_KEY = 'customersList';

export interface CustomersListState {
  /** 0-based page index, observed from the `page` query param (1-based there). */
  pageIndex: number;
  /** Page size, observed from the `pageSize` query param. */
  pageSize: number;
  /** Normalized name filter, observed from the `q` query param. */
  nameFilter: string;
  /** The exact fetch identity (normalized) behind the current data — in-flight or loaded. */
  fetchedQuery: CustomersListQuery | null;
  /** Customers for the CURRENT api page. */
  customers: Customer[];
  /** API paging details of the current page. */
  info: PagingInfo | null;
  request: AsyncRequestState;
}

/** Normalized identifier of one customers fetch: paging plus the name filter. */
export interface CustomersListQuery {
  pageIndex: number;
  pageSize: number;
  nameFilter: string;
}

/** Builds the fetch identity from the current state. */
function queryFromState(state: CustomersListState): CustomersListQuery {
  return {
    pageIndex: state.pageIndex,
    pageSize: state.pageSize,
    nameFilter: state.nameFilter,
  };
}

export function sameQuery(left: CustomersListQuery | null, right: CustomersListQuery): boolean {
  return (
    left !== null &&
    left.pageIndex === right.pageIndex &&
    left.pageSize === right.pageSize &&
    left.nameFilter === right.nameFilter
  );
}

export const CUSTOMERS_LIST_INITIAL_STATE: CustomersListState = {
  pageIndex: 0,
  pageSize: 25,
  nameFilter: '',
  fetchedQuery: null,
  customers: [],
  info: null,
  request: INITIAL_ASYNC_REQUEST_STATE,
};

export const customersListReducer = createReducer(
  CUSTOMERS_LIST_INITIAL_STATE,

  on(CUSTOMERS_LIST_ACTIONS.setQueryFromUrl, (state, { pageIndex, pageSize, nameFilter }) => {
    const normalizedFilter = nameFilter.trim();
    if (
      pageIndex === state.pageIndex &&
      pageSize === state.pageSize &&
      normalizedFilter === state.nameFilter
    ) {
      return state;
    }
    return { ...state, pageIndex, pageSize, nameFilter: normalizedFilter };
  }),

  // The state decides whether a real request is needed: the fetch may only go
  // in flight when the query differs from the one being fetched/loaded.
  on(CUSTOMERS_LIST_ACTIONS.loadCustomers, (state) => {
    const query = queryFromState(state);
    if (sameQuery(state.fetchedQuery, query)) {
      return state;
    }
    return { ...state, request: startLoading(state.request), fetchedQuery: query };
  }),

  on(CUSTOMERS_LIST_ACTIONS.loadCustomersSuccess, (state, { customers, info }) => ({
    ...state,
    customers,
    info,
    request: { ...state.request, status: 'loaded' as const, error: null },
  })),

  on(CUSTOMERS_LIST_ACTIONS.loadCustomersFailure, (state, { error }) => ({
    ...state,
    customers: [],
    info: null,
    fetchedQuery: null,
    request: applyFailure(state.request, error),
  })),

  // Local mutation sync: prepend a newly created customer on top of the
  // current page without refetching. Only visible on the first page when the
  // name matches the active filter; the paging total is always bumped silently.
  on(CUSTOMERS_LIST_ACTIONS.customerCreated, (state, { customer }) => {
    if (state.info === null || state.fetchedQuery === null) {
      return state;
    }
    if (state.customers.some((item) => item.id === customer.id)) {
      return state;
    }
    const matchesFilter =
      !state.nameFilter || customer.name.toLowerCase().includes(state.nameFilter.toLowerCase());
    const shouldPrepend = state.pageIndex === 0 && matchesFilter;
    const customers = shouldPrepend
      ? [customer, ...state.customers].slice(0, state.pageSize)
      : state.customers;
    return {
      ...state,
      customers,
      info: {
        ...state.info,
        totalCount: state.info.totalCount + 1,
        length: Math.min(customers.length, state.pageSize),
      },
    };
  }),

  // Local mutation sync: replace the current customer in place if it is on
  // the current page; otherwise ignore it (the next fetch will include it).
  on(CUSTOMERS_LIST_ACTIONS.customerUpdated, (state, { customer }) => {
    if (state.info === null) {
      return state;
    }
    if (!state.customers.some((item) => item.id === customer.id)) {
      return state;
    }
    return {
      ...state,
      customers: state.customers.map((item) => (item.id === customer.id ? customer : item)),
    };
  }),
);

export const customersListFeature = createFeature({
  name: CUSTOMERS_LIST_FEATURE_KEY,
  reducer: customersListReducer,
});
