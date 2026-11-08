import { createFeature, createReducer, on } from '@ngrx/store';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import {
  INITIAL_ASYNC_REQUEST_STATE,
  applyFailure,
  startLoading,
  type AsyncRequestState,
} from '../../../../shared/models/async-request-state';
import { CUSTOMER_MUTATIONS_ACTIONS } from './customer-mutations.actions';

export const CUSTOMER_MUTATIONS_FEATURE_KEY = 'customerMutations';

export interface CustomerMutationsState {
  /** The create request fragment (form-side saving spinner + inline error). */
  createRequest: AsyncRequestState;
  /** The update request fragment (form-side saving spinner + inline error). */
  updateRequest: AsyncRequestState;
}

export const CUSTOMER_MUTATIONS_INITIAL_STATE: CustomerMutationsState = {
  createRequest: INITIAL_ASYNC_REQUEST_STATE,
  updateRequest: INITIAL_ASYNC_REQUEST_STATE,
};

/** A repeated submit for the same request is a no-op: one request in flight. */
function inFlight(state: AsyncRequestState): boolean {
  return state.status === LOAD_STATUS.Loading;
}

export const customerMutationsReducer = createReducer(
  CUSTOMER_MUTATIONS_INITIAL_STATE,

  on(CUSTOMER_MUTATIONS_ACTIONS.createCustomer, (state) =>
    inFlight(state.createRequest)
      ? state
      : { ...state, createRequest: startLoading(state.createRequest) },
  ),

  on(CUSTOMER_MUTATIONS_ACTIONS.createCustomerSuccess, (state) => ({
    ...state,
    createRequest: { ...state.createRequest, status: LOAD_STATUS.Loaded },
  })),

  on(CUSTOMER_MUTATIONS_ACTIONS.createCustomerFailure, (state, { error }) => ({
    ...state,
    createRequest: applyFailure(state.createRequest, error),
  })),

  on(CUSTOMER_MUTATIONS_ACTIONS.updateCustomer, (state) =>
    inFlight(state.updateRequest)
      ? state
      : { ...state, updateRequest: startLoading(state.updateRequest) },
  ),

  on(CUSTOMER_MUTATIONS_ACTIONS.updateCustomerSuccess, (state) => ({
    ...state,
    updateRequest: { ...state.updateRequest, status: LOAD_STATUS.Loaded },
  })),

  on(CUSTOMER_MUTATIONS_ACTIONS.updateCustomerFailure, (state, { error }) => ({
    ...state,
    updateRequest: applyFailure(state.updateRequest, error),
  })),
);

export const customerMutationsFeature = createFeature({
  name: CUSTOMER_MUTATIONS_FEATURE_KEY,
  reducer: customerMutationsReducer,
});
