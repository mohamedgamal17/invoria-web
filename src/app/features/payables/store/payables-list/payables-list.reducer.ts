import { createFeature, createReducer, on } from '@ngrx/store';

import type { PagingInfo } from '../../../../core/models/paging';
import {
  INITIAL_ASYNC_REQUEST_STATE,
  applyFailure,
  startLoading,
  type AsyncRequestState,
} from '../../../../shared/models/async-request-state';
import type { Payable } from '../../models/payable.entity';
import { PAYABLES_LIST_ACTIONS } from './payables-list.actions';

export const PAYABLES_LIST_FEATURE_KEY = 'payablesList';

export interface PayablesListState {
  /** 0-based page index, observed from the `page` query param (1-based there). */
  pageIndex: number;
  /** Page size, observed from the `pageSize` query param. */
  pageSize: number;
  /** Normalized supplier filter, observed from the `supplierId` query param (legacy `partyId`). */
  supplierIdFilter: string;
  /** Normalized source filter, observed from the `sourceId` query param. */
  sourceIdFilter: string;
  /** Paid filter, observed from the `isPaid` query param. */
  isPaidFilter: boolean | null;
  /** The exact fetch identity (normalized) behind the current data — in-flight or loaded. */
  fetchedQuery: PayablesListQuery | null;
  /** Enriched payables for the CURRENT api page. */
  payables: Payable[];
  /** API paging details of the current page. */
  info: PagingInfo | null;
  request: AsyncRequestState;
}

/** Normalized identifier of one payables fetch: paging plus the filters. */
export interface PayablesListQuery {
  pageIndex: number;
  pageSize: number;
  supplierIdFilter: string;
  sourceIdFilter: string;
  isPaidFilter: boolean | null;
}

/** Builds the fetch identity from the current state. */
function queryFromState(state: PayablesListState): PayablesListQuery {
  return {
    pageIndex: state.pageIndex,
    pageSize: state.pageSize,
    supplierIdFilter: state.supplierIdFilter,
    sourceIdFilter: state.sourceIdFilter,
    isPaidFilter: state.isPaidFilter,
  };
}

export function sameQuery(left: PayablesListQuery | null, right: PayablesListQuery): boolean {
  return (
    left !== null &&
    left.pageIndex === right.pageIndex &&
    left.pageSize === right.pageSize &&
    left.supplierIdFilter === right.supplierIdFilter &&
    left.sourceIdFilter === right.sourceIdFilter &&
    left.isPaidFilter === right.isPaidFilter
  );
}

export const PAYABLES_LIST_INITIAL_STATE: PayablesListState = {
  pageIndex: 0,
  pageSize: 25,
  supplierIdFilter: '',
  sourceIdFilter: '',
  isPaidFilter: null,
  fetchedQuery: null,
  payables: [],
  info: null,
  request: INITIAL_ASYNC_REQUEST_STATE,
};

export const payablesListReducer = createReducer(
  PAYABLES_LIST_INITIAL_STATE,

  on(PAYABLES_LIST_ACTIONS.setQueryFromUrl, (state, query) => {
    const normalizedSupplierId = query.supplierIdFilter.trim();
    const normalizedSourceId = query.sourceIdFilter.trim();
    if (
      query.pageIndex === state.pageIndex &&
      query.pageSize === state.pageSize &&
      normalizedSupplierId === state.supplierIdFilter &&
      normalizedSourceId === state.sourceIdFilter &&
      query.isPaidFilter === state.isPaidFilter
    ) {
      return state;
    }
    return {
      ...state,
      pageIndex: query.pageIndex,
      pageSize: query.pageSize,
      supplierIdFilter: normalizedSupplierId,
      sourceIdFilter: normalizedSourceId,
      isPaidFilter: query.isPaidFilter,
    };
  }),

  // The state decides whether a real request is needed: the fetch may only go
  // in flight when the query differs from the one being fetched/loaded.
  on(PAYABLES_LIST_ACTIONS.loadPayables, (state) => {
    const query = queryFromState(state);
    if (sameQuery(state.fetchedQuery, query)) {
      return state;
    }
    return { ...state, request: startLoading(state.request), fetchedQuery: query };
  }),

  on(PAYABLES_LIST_ACTIONS.loadPayablesSuccess, (state, { payables, info }) => ({
    ...state,
    payables,
    info,
    request: { ...state.request, status: 'loaded' as const, error: null },
  })),

  on(PAYABLES_LIST_ACTIONS.loadPayablesFailure, (state, { error }) => ({
    ...state,
    payables: [],
    info: null,
    fetchedQuery: null,
    request: applyFailure(state.request, error),
  })),

  // Local mutation sync: a payable settled on the details page replaces its row
  // in place when it is on the current page (the next fetch includes it otherwise).
  on(PAYABLES_LIST_ACTIONS.payableUpdated, (state, { payable }) => {
    if (state.info === null) {
      return state;
    }
    if (!state.payables.some((item) => item.id === payable.id)) {
      return state;
    }
    return {
      ...state,
      payables: state.payables.map((item) => (item.id === payable.id ? payable : item)),
    };
  }),
);

export const payablesListFeature = createFeature({
  name: PAYABLES_LIST_FEATURE_KEY,
  reducer: payablesListReducer,
});
