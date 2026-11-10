import { createFeature, createReducer, on } from '@ngrx/store';

import type { PagingInfo } from '../../../../core/models/paging';
import {
  INITIAL_ASYNC_REQUEST_STATE,
  applyFailure,
  startLoading,
  type AsyncRequestState,
} from '../../../../shared/models/async-request-state';
import type { Supplier } from '../../models/supplier.entity';
import { SUPPLIERS_LIST_ACTIONS } from './suppliers-list.actions';

export const SUPPLIERS_LIST_FEATURE_KEY = 'suppliersList';

export interface SuppliersListState {
  /** 0-based page index, observed from the `page` query param (1-based there). */
  pageIndex: number;
  /** Page size, observed from the `pageSize` query param. */
  pageSize: number;
  /** Normalized name filter, observed from the `q` query param. */
  nameFilter: string;
  /** The exact fetch identity (normalized) behind the current data — in-flight or loaded. */
  fetchedQuery: SuppliersListQuery | null;
  /** Suppliers for the CURRENT api page. */
  suppliers: Supplier[];
  /** API paging details of the current page. */
  info: PagingInfo | null;
  request: AsyncRequestState;
}

/** Normalized identifier of one suppliers fetch: paging plus the name filter. */
export interface SuppliersListQuery {
  pageIndex: number;
  pageSize: number;
  nameFilter: string;
}

/** Builds the fetch identity from the current state. */
function queryFromState(state: SuppliersListState): SuppliersListQuery {
  return {
    pageIndex: state.pageIndex,
    pageSize: state.pageSize,
    nameFilter: state.nameFilter,
  };
}

export function sameQuery(left: SuppliersListQuery | null, right: SuppliersListQuery): boolean {
  return (
    left !== null &&
    left.pageIndex === right.pageIndex &&
    left.pageSize === right.pageSize &&
    left.nameFilter === right.nameFilter
  );
}

export const SUPPLIERS_LIST_INITIAL_STATE: SuppliersListState = {
  pageIndex: 0,
  pageSize: 25,
  nameFilter: '',
  fetchedQuery: null,
  suppliers: [],
  info: null,
  request: INITIAL_ASYNC_REQUEST_STATE,
};

export const suppliersListReducer = createReducer(
  SUPPLIERS_LIST_INITIAL_STATE,

  on(SUPPLIERS_LIST_ACTIONS.setQueryFromUrl, (state, { pageIndex, pageSize, nameFilter }) => {
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
  on(SUPPLIERS_LIST_ACTIONS.loadSuppliers, (state) => {
    const query = queryFromState(state);
    if (sameQuery(state.fetchedQuery, query)) {
      return state;
    }
    return { ...state, request: startLoading(state.request), fetchedQuery: query };
  }),

  on(SUPPLIERS_LIST_ACTIONS.loadSuppliersSuccess, (state, { suppliers, info }) => ({
    ...state,
    suppliers,
    info,
    request: { ...state.request, status: 'loaded' as const, error: null },
  })),

  on(SUPPLIERS_LIST_ACTIONS.loadSuppliersFailure, (state, { error }) => ({
    ...state,
    suppliers: [],
    info: null,
    fetchedQuery: null,
    request: applyFailure(state.request, error),
  })),

  // Local mutation sync: prepend a newly created supplier on top of the
  // current page without refetching. Only visible on the first page when the
  // name matches the active filter; the paging total is always bumped silently.
  on(SUPPLIERS_LIST_ACTIONS.supplierCreated, (state, { supplier }) => {
    if (state.info === null || state.fetchedQuery === null) {
      return state;
    }
    if (state.suppliers.some((item) => item.id === supplier.id)) {
      return state;
    }
    const matchesFilter =
      !state.nameFilter || supplier.name.toLowerCase().includes(state.nameFilter.toLowerCase());
    const shouldPrepend = state.pageIndex === 0 && matchesFilter;
    const suppliers = shouldPrepend
      ? [supplier, ...state.suppliers].slice(0, state.pageSize)
      : state.suppliers;
    return {
      ...state,
      suppliers,
      info: {
        ...state.info,
        totalCount: state.info.totalCount + 1,
        length: Math.min(suppliers.length, state.pageSize),
      },
    };
  }),

  // Local mutation sync: replace the current supplier in place if it is on
  // the current page; otherwise ignore it (the next fetch will include it).
  on(SUPPLIERS_LIST_ACTIONS.supplierUpdated, (state, { supplier }) => {
    if (state.info === null) {
      return state;
    }
    if (!state.suppliers.some((item) => item.id === supplier.id)) {
      return state;
    }
    return {
      ...state,
      suppliers: state.suppliers.map((item) => (item.id === supplier.id ? supplier : item)),
    };
  }),
);

export const suppliersListFeature = createFeature({
  name: SUPPLIERS_LIST_FEATURE_KEY,
  reducer: suppliersListReducer,
});
