import { createFeature, createReducer, on } from '@ngrx/store';

import type { PagingInfo } from '../../../../core/models/paging';
import {
  INITIAL_ASYNC_REQUEST_STATE,
  applyFailure,
  startLoading,
  type AsyncRequestState,
} from '../../../../shared/models/async-request-state';
import type { Receivable } from '../../models/receivable.entity';
import { RECEIVABLES_LIST_ACTIONS } from './receivables-list.actions';

export const RECEIVABLES_LIST_FEATURE_KEY = 'receivablesList';

export interface ReceivablesListState {
  /** 0-based page index, observed from the `page` query param (1-based there). */
  pageIndex: number;
  /** Page size, observed from the `pageSize` query param. */
  pageSize: number;
  /** Normalized party (customer) filter, observed from the `partyId` query param. */
  partyIdFilter: string;
  /** Normalized source (order) filter, observed from the `sourceId` query param. */
  sourceIdFilter: string;
  /** Paid filter, observed from the `isPaid` query param. */
  isPaidFilter: boolean | null;
  /** The exact fetch identity (normalized) behind the current data — in-flight or loaded. */
  fetchedQuery: ReceivablesListQuery | null;
  /** Receivables for the CURRENT api page. */
  receivables: Receivable[];
  /** API paging details of the current page. */
  info: PagingInfo | null;
  request: AsyncRequestState;
}

/** Normalized identifier of one receivables fetch: paging plus the filters. */
export interface ReceivablesListQuery {
  pageIndex: number;
  pageSize: number;
  partyIdFilter: string;
  sourceIdFilter: string;
  isPaidFilter: boolean | null;
}

/** Builds the fetch identity from the current state. */
function queryFromState(state: ReceivablesListState): ReceivablesListQuery {
  return {
    pageIndex: state.pageIndex,
    pageSize: state.pageSize,
    partyIdFilter: state.partyIdFilter,
    sourceIdFilter: state.sourceIdFilter,
    isPaidFilter: state.isPaidFilter,
  };
}

export function sameQuery(left: ReceivablesListQuery | null, right: ReceivablesListQuery): boolean {
  return (
    left !== null &&
    left.pageIndex === right.pageIndex &&
    left.pageSize === right.pageSize &&
    left.partyIdFilter === right.partyIdFilter &&
    left.sourceIdFilter === right.sourceIdFilter &&
    left.isPaidFilter === right.isPaidFilter
  );
}

export const RECEIVABLES_LIST_INITIAL_STATE: ReceivablesListState = {
  pageIndex: 0,
  pageSize: 25,
  partyIdFilter: '',
  sourceIdFilter: '',
  isPaidFilter: null,
  fetchedQuery: null,
  receivables: [],
  info: null,
  request: INITIAL_ASYNC_REQUEST_STATE,
};

export const receivablesListReducer = createReducer(
  RECEIVABLES_LIST_INITIAL_STATE,

  on(RECEIVABLES_LIST_ACTIONS.setQueryFromUrl, (state, query) => {
    const normalizedPartyId = query.partyIdFilter.trim();
    const normalizedSourceId = query.sourceIdFilter.trim();
    if (
      query.pageIndex === state.pageIndex &&
      query.pageSize === state.pageSize &&
      normalizedPartyId === state.partyIdFilter &&
      normalizedSourceId === state.sourceIdFilter &&
      query.isPaidFilter === state.isPaidFilter
    ) {
      return state;
    }
    return {
      ...state,
      pageIndex: query.pageIndex,
      pageSize: query.pageSize,
      partyIdFilter: normalizedPartyId,
      sourceIdFilter: normalizedSourceId,
      isPaidFilter: query.isPaidFilter,
    };
  }),

  // The state decides whether a real request is needed: the fetch may only go
  // in flight when the query differs from the one being fetched/loaded.
  on(RECEIVABLES_LIST_ACTIONS.loadReceivables, (state) => {
    const query = queryFromState(state);
    if (sameQuery(state.fetchedQuery, query)) {
      return state;
    }
    return { ...state, request: startLoading(state.request), fetchedQuery: query };
  }),

  on(RECEIVABLES_LIST_ACTIONS.loadReceivablesSuccess, (state, { receivables, info }) => ({
    ...state,
    receivables,
    info,
    request: { ...state.request, status: 'loaded' as const, error: null },
  })),

  on(RECEIVABLES_LIST_ACTIONS.loadReceivablesFailure, (state, { error }) => ({
    ...state,
    receivables: [],
    info: null,
    fetchedQuery: null,
    request: applyFailure(state.request, error),
  })),

  // Local mutation sync: a receivable settled on the details page replaces its row
  // in place when it is on the current page (the next fetch includes it otherwise).
  on(RECEIVABLES_LIST_ACTIONS.receivableUpdated, (state, { receivable }) => {
    if (state.info === null) {
      return state;
    }
    if (!state.receivables.some((item) => item.id === receivable.id)) {
      return state;
    }
    return {
      ...state,
      receivables: state.receivables.map((item) => (item.id === receivable.id ? receivable : item)),
    };
  }),
);

export const receivablesListFeature = createFeature({
  name: RECEIVABLES_LIST_FEATURE_KEY,
  reducer: receivablesListReducer,
});
