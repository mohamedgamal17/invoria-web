import { createFeature, createReducer, on } from '@ngrx/store';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import {
  INITIAL_ASYNC_REQUEST_STATE,
  applyFailure,
  startLoading,
  type AsyncRequestState,
} from '../../../../shared/models/async-request-state';
import { PAYABLES_MUTATIONS_ACTIONS } from './payables-mutations.actions';

export const PAYABLES_MUTATIONS_FEATURE_KEY = 'payablesMutations';

export interface PayablesMutationsState {
  /** The settle request fragment (modal saving spinner + inline error handled globally). */
  settleRequest: AsyncRequestState;
}

export const PAYABLES_MUTATIONS_INITIAL_STATE: PayablesMutationsState = {
  settleRequest: INITIAL_ASYNC_REQUEST_STATE,
};

/** A repeated submit for the same request is a no-op: one request in flight. */
function inFlight(state: AsyncRequestState): boolean {
  return state.status === LOAD_STATUS.Loading;
}

export const payablesMutationsReducer = createReducer(
  PAYABLES_MUTATIONS_INITIAL_STATE,

  on(PAYABLES_MUTATIONS_ACTIONS.settlePayable, (state) =>
    inFlight(state.settleRequest)
      ? state
      : { ...state, settleRequest: startLoading(state.settleRequest) },
  ),

  on(PAYABLES_MUTATIONS_ACTIONS.settlePayableSuccess, (state) => ({
    ...state,
    settleRequest: { ...state.settleRequest, status: LOAD_STATUS.Loaded },
  })),

  on(PAYABLES_MUTATIONS_ACTIONS.settlePayableFailure, (state, { error }) => ({
    ...state,
    settleRequest: applyFailure(state.settleRequest, error),
  })),
);

export const payablesMutationsFeature = createFeature({
  name: PAYABLES_MUTATIONS_FEATURE_KEY,
  reducer: payablesMutationsReducer,
});
