import { createFeature, createReducer, on } from '@ngrx/store';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import {
  INITIAL_ASYNC_REQUEST_STATE,
  applyFailure,
  startLoading,
  type AsyncRequestState,
} from '../../../../shared/models/async-request-state';
import { PURCHASE_ORDERS_MUTATIONS_ACTIONS } from './purchase-orders-mutations.actions';

export const PURCHASE_ORDERS_MUTATIONS_FEATURE_KEY = 'purchaseOrdersMutations';

export interface PurchaseOrdersMutationsState {
  /** The state-transition request fragment (details-page in-progress spinner + inline error). */
  transitionRequest: AsyncRequestState;
}

export const PURCHASE_ORDERS_MUTATIONS_INITIAL_STATE: PurchaseOrdersMutationsState = {
  transitionRequest: INITIAL_ASYNC_REQUEST_STATE,
};

/** A repeated submit for the same request is a no-op: one request in flight. */
function inFlight(state: AsyncRequestState): boolean {
  return state.status === LOAD_STATUS.Loading;
}

export const purchaseOrdersMutationsReducer = createReducer(
  PURCHASE_ORDERS_MUTATIONS_INITIAL_STATE,

  on(PURCHASE_ORDERS_MUTATIONS_ACTIONS.transitionPurchaseOrder, (state) =>
    inFlight(state.transitionRequest)
      ? state
      : { ...state, transitionRequest: startLoading(state.transitionRequest) },
  ),

  on(PURCHASE_ORDERS_MUTATIONS_ACTIONS.transitionPurchaseOrderSuccess, (state) => ({
    ...state,
    transitionRequest: { ...state.transitionRequest, status: LOAD_STATUS.Loaded },
  })),

  on(PURCHASE_ORDERS_MUTATIONS_ACTIONS.transitionPurchaseOrderFailure, (state, { error }) => ({
    ...state,
    transitionRequest: applyFailure(state.transitionRequest, error),
  })),
);

export const purchaseOrdersMutationsFeature = createFeature({
  name: PURCHASE_ORDERS_MUTATIONS_FEATURE_KEY,
  reducer: purchaseOrdersMutationsReducer,
});
