import { createFeature, createReducer, on } from '@ngrx/store';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import {
  INITIAL_ASYNC_REQUEST_STATE,
  applyFailure,
  startLoading,
  type AsyncRequestState,
} from '../../../../shared/models/async-request-state';
import { SUPPLIER_MUTATIONS_ACTIONS } from './supplier-mutations.actions';

export const SUPPLIER_MUTATIONS_FEATURE_KEY = 'supplierMutations';

export interface SupplierMutationsState {
  /** The create request fragment (form-side saving spinner + inline error). */
  createRequest: AsyncRequestState;
  /** The update request fragment (form-side saving spinner + inline error). */
  updateRequest: AsyncRequestState;
}

export const SUPPLIER_MUTATIONS_INITIAL_STATE: SupplierMutationsState = {
  createRequest: INITIAL_ASYNC_REQUEST_STATE,
  updateRequest: INITIAL_ASYNC_REQUEST_STATE,
};

/** A repeated submit for the same request is a no-op: one request in flight. */
function inFlight(state: AsyncRequestState): boolean {
  return state.status === LOAD_STATUS.Loading;
}

export const supplierMutationsReducer = createReducer(
  SUPPLIER_MUTATIONS_INITIAL_STATE,

  on(SUPPLIER_MUTATIONS_ACTIONS.createSupplier, (state) =>
    inFlight(state.createRequest)
      ? state
      : { ...state, createRequest: startLoading(state.createRequest) },
  ),

  on(SUPPLIER_MUTATIONS_ACTIONS.createSupplierSuccess, (state) => ({
    ...state,
    createRequest: { ...state.createRequest, status: LOAD_STATUS.Loaded },
  })),

  on(SUPPLIER_MUTATIONS_ACTIONS.createSupplierFailure, (state, { error }) => ({
    ...state,
    createRequest: applyFailure(state.createRequest, error),
  })),

  on(SUPPLIER_MUTATIONS_ACTIONS.updateSupplier, (state) =>
    inFlight(state.updateRequest)
      ? state
      : { ...state, updateRequest: startLoading(state.updateRequest) },
  ),

  on(SUPPLIER_MUTATIONS_ACTIONS.updateSupplierSuccess, (state) => ({
    ...state,
    updateRequest: { ...state.updateRequest, status: LOAD_STATUS.Loaded },
  })),

  on(SUPPLIER_MUTATIONS_ACTIONS.updateSupplierFailure, (state, { error }) => ({
    ...state,
    updateRequest: applyFailure(state.updateRequest, error),
  })),
);

export const supplierMutationsFeature = createFeature({
  name: SUPPLIER_MUTATIONS_FEATURE_KEY,
  reducer: supplierMutationsReducer,
});
