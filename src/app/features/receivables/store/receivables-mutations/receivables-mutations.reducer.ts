import { createFeature, createReducer, on } from '@ngrx/store';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import {
  INITIAL_ASYNC_REQUEST_STATE,
  applyFailure,
  startLoading,
  type AsyncRequestState,
} from '../../../../shared/models/async-request-state';
import { RECEIVABLES_MUTATIONS_ACTIONS } from './receivables-mutations.actions';

export const RECEIVABLES_MUTATIONS_FEATURE_KEY = 'receivablesMutations';

export interface ReceivablesMutationsState {
  /** The settle request fragment (modal saving spinner + inline error handled globally). */
  settleRequest: AsyncRequestState;
}

export const RECEIVABLES_MUTATIONS_INITIAL_STATE: ReceivablesMutationsState = {
  settleRequest: INITIAL_ASYNC_REQUEST_STATE,
};

/** A repeated submit for the same request is a no-op: one request in flight. */
function inFlight(state: AsyncRequestState): boolean {
  return state.status === LOAD_STATUS.Loading;
}

export const receivablesMutationsReducer = createReducer(
  RECEIVABLES_MUTATIONS_INITIAL_STATE,

  on(RECEIVABLES_MUTATIONS_ACTIONS.settleReceivable, (state) =>
    inFlight(state.settleRequest)
      ? state
      : { ...state, settleRequest: startLoading(state.settleRequest) },
  ),

  on(RECEIVABLES_MUTATIONS_ACTIONS.settleReceivableSuccess, (state) => ({
    ...state,
    settleRequest: { ...state.settleRequest, status: LOAD_STATUS.Loaded },
  })),

  on(RECEIVABLES_MUTATIONS_ACTIONS.settleReceivableFailure, (state, { error }) => ({
    ...state,
    settleRequest: applyFailure(state.settleRequest, error),
  })),
);

export const receivablesMutationsFeature = createFeature({
  name: RECEIVABLES_MUTATIONS_FEATURE_KEY,
  reducer: receivablesMutationsReducer,
});
