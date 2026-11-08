import { createFeature, createReducer, on } from '@ngrx/store';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import {
  INITIAL_ASYNC_REQUEST_STATE,
  applyFailure,
  startLoading,
  type AsyncRequestState,
} from '../../../../shared/models/async-request-state';
import { PRODUCT_MUTATIONS_ACTIONS } from './products-mutations.actions';

export const PRODUCTS_MUTATIONS_FEATURE_KEY = 'productsMutations';

export interface ProductsMutationsState {
  /** The create request fragment (form-side saving spinner + inline error). */
  createRequest: AsyncRequestState;
  /** The update request fragment (form-side saving spinner + inline error). */
  updateRequest: AsyncRequestState;
}

export const PRODUCTS_MUTATIONS_INITIAL_STATE: ProductsMutationsState = {
  createRequest: INITIAL_ASYNC_REQUEST_STATE,
  updateRequest: INITIAL_ASYNC_REQUEST_STATE,
};

/** A repeated submit for the same request is a no-op: one request in flight. */
function inFlight(state: AsyncRequestState): boolean {
  return state.status === LOAD_STATUS.Loading;
}

export const productsMutationsReducer = createReducer(
  PRODUCTS_MUTATIONS_INITIAL_STATE,

  on(PRODUCT_MUTATIONS_ACTIONS.createProduct, (state) =>
    inFlight(state.createRequest)
      ? state
      : { ...state, createRequest: startLoading(state.createRequest) },
  ),

  on(PRODUCT_MUTATIONS_ACTIONS.createProductSuccess, (state) => ({
    ...state,
    createRequest: { ...state.createRequest, status: LOAD_STATUS.Loaded },
  })),

  on(PRODUCT_MUTATIONS_ACTIONS.createProductFailure, (state, { error }) => ({
    ...state,
    createRequest: applyFailure(state.createRequest, error),
  })),

  on(PRODUCT_MUTATIONS_ACTIONS.updateProduct, (state) =>
    inFlight(state.updateRequest)
      ? state
      : { ...state, updateRequest: startLoading(state.updateRequest) },
  ),

  on(PRODUCT_MUTATIONS_ACTIONS.updateProductSuccess, (state) => ({
    ...state,
    updateRequest: { ...state.updateRequest, status: LOAD_STATUS.Loaded },
  })),

  on(PRODUCT_MUTATIONS_ACTIONS.updateProductFailure, (state, { error }) => ({
    ...state,
    updateRequest: applyFailure(state.updateRequest, error),
  })),
);

export const productsMutationsFeature = createFeature({
  name: PRODUCTS_MUTATIONS_FEATURE_KEY,
  reducer: productsMutationsReducer,
});
