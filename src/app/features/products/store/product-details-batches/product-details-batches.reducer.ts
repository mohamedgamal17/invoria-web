import { createFeature, createReducer, on } from '@ngrx/store';

import type { PagingInfo } from '../../../../core/models/paging';
import {
  INITIAL_ASYNC_REQUEST_STATE,
  applyFailure,
  startLoading,
  type AsyncRequestState,
} from '../../../../shared/models/async-request-state';
import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { Batch } from '../../../inventory/models/batch.entity';
import { PRODUCT_BATCHES_ACTIONS } from './product-details-batches.actions';

export const PRODUCT_BATCHES_FEATURE_KEY = 'productDetailsBatches';

export const DEFAULT_BATCHES_PAGE_SIZE = 25;

export interface ProductBatchesState {
  productId: string;
  /** `false` keeps the fetch idle — batches load only after the Batches tab opens. */
  batchesTabOpened: boolean;
  /** 0-based page index, observed from the 1-based `page` query param. */
  pageIndex: number;
  /** Page size, observed from the `pageSize` query param. */
  pageSize: number;
  /** The exact query (normalized) behind the current data — in-flight or loaded. */
  fetchedQuery: ProductBatchesQuery | null;
  /** Batches for the CURRENT api pagination. */
  batches: Batch[];
  /** API paging details of the current page. */
  info: PagingInfo | null;
  request: AsyncRequestState;
  /** The create/update request fragment (dialog-side saving spinner + inline error). */
  saveRequest: AsyncRequestState;
}

/** Normalized identifier of one batches fetch: paging (the panel has no filters). */
export interface ProductBatchesQuery {
  pageIndex: number;
  pageSize: number;
}

/** Builds the fetch identity from the current state. */
function queryFromState(state: ProductBatchesState): ProductBatchesQuery {
  return {
    pageIndex: state.pageIndex,
    pageSize: state.pageSize,
  };
}

export function sameQuery(left: ProductBatchesQuery | null, right: ProductBatchesQuery): boolean {
  return (
    left !== null &&
    left.pageIndex === right.pageIndex &&
    left.pageSize === right.pageSize
  );
}

export const PRODUCT_BATCHES_INITIAL_STATE: ProductBatchesState = {
  productId: '',
  batchesTabOpened: false,
  pageIndex: 0,
  pageSize: DEFAULT_BATCHES_PAGE_SIZE,
  fetchedQuery: null,
  batches: [],
  info: null,
  request: INITIAL_ASYNC_REQUEST_STATE,
  saveRequest: INITIAL_ASYNC_REQUEST_STATE,
};

export const productBatchesReducer = createReducer(
  PRODUCT_BATCHES_INITIAL_STATE,

  on(PRODUCT_BATCHES_ACTIONS.batchesTabOpened, (state) =>
    state.batchesTabOpened ? state : { ...state, batchesTabOpened: true },
  ),

  on(PRODUCT_BATCHES_ACTIONS.setPagingFromUrl, (state, { pageIndex, pageSize }) => {
    if (pageIndex === state.pageIndex && pageSize === state.pageSize) {
      return state;
    }
    return { ...state, pageIndex, pageSize };
  }),

  on(PRODUCT_BATCHES_ACTIONS.pageChange, (state, { pageIndex, pageSize }) =>
    pageIndex === state.pageIndex && pageSize === state.pageSize
      ? state
      : { ...state, pageIndex, pageSize },
  ),

  // The state decides whether a real request is needed: the fetch may only go
  // in flight when the tab gate is open and the owning product context is
  // known, and only when the query differs from the one being fetched/loaded.
  on(PRODUCT_BATCHES_ACTIONS.loadBatches, (state) => {
    if (!state.batchesTabOpened || !state.productId) {
      return state;
    }
    const query = queryFromState(state);
    if (sameQuery(state.fetchedQuery, query)) {
      return state;
    }
    return { ...state, request: startLoading(state.request), fetchedQuery: query };
  }),

  on(PRODUCT_BATCHES_ACTIONS.loadBatchesSuccess, (state, { batches, info }) => ({
    ...state,
    batches,
    info,
    request: { ...state.request, status: LOAD_STATUS.Loaded, error: null },
  })),

  on(PRODUCT_BATCHES_ACTIONS.loadBatchesFailure, (state, { error }) => ({
    ...state,
    batches: [],
    info: null,
    fetchedQuery: null,
    request: applyFailure(state.request, error),
  })),

  // --- Batch mutations (create / update) ------------------------------------

  on(PRODUCT_BATCHES_ACTIONS.createBatch, (state) =>
    state.saveRequest.status === LOAD_STATUS.Loading
      ? state
      : { ...state, saveRequest: startLoading(state.saveRequest) },
  ),

  on(
    PRODUCT_BATCHES_ACTIONS.createBatchSuccess,
    PRODUCT_BATCHES_ACTIONS.updateBatchSuccess,
    (state) => ({
      ...state,
      saveRequest: { ...state.saveRequest, status: LOAD_STATUS.Loaded, error: null },
    }),
  ),

  on(
    PRODUCT_BATCHES_ACTIONS.createBatchFailure,
    PRODUCT_BATCHES_ACTIONS.updateBatchFailure,
    (state, { error }) => ({
      ...state,
      saveRequest: applyFailure(state.saveRequest, error),
    }),
  ),

  on(PRODUCT_BATCHES_ACTIONS.updateBatch, (state) =>
    state.saveRequest.status === LOAD_STATUS.Loading
      ? state
      : { ...state, saveRequest: startLoading(state.saveRequest) },
  ),

  on(PRODUCT_BATCHES_ACTIONS.reset, (state, { productId }) => ({
    ...PRODUCT_BATCHES_INITIAL_STATE,
    productId,
  })),
);

export const productBatchesFeature = createFeature({
  name: PRODUCT_BATCHES_FEATURE_KEY,
  reducer: productBatchesReducer,
});
