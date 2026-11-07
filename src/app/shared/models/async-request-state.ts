import type { ApiErrorPresentation } from '../../core/http/api-error.presenter';
import { presentApiError } from '../../core/http/api-error.presenter';
import { LOAD_STATUS } from './load-status';
import type { LoadStatus } from './load-status';

/**
 * Reusable async-request fragment embedded by feature states.
 * The inline `error` shown by pages and the `failureNonce` consumed by
 * presentation effects (global toast/route handling) both live here.
 */
export interface AsyncRequestState {
  status: LoadStatus;
  /** Toast-ready error detail for inline display; `null` when idle/loaded. */
  error: string | null;
  /** Increments on each failure so presentation effects can react to repeats. */
  failureNonce: number;
}

export const INITIAL_ASYNC_REQUEST_STATE: AsyncRequestState = {
  status: LOAD_STATUS.Idle,
  error: null,
  failureNonce: 0,
};

/** Marks a request slice as in flight and clears any stale inline error. */
export function startLoading(state: AsyncRequestState): AsyncRequestState {
  return { ...state, status: LOAD_STATUS.Loading, error: null };
}

/**
 * Pure reducer helper shared by every feature failure handler: builds the
 * api error presentation once, stores the inline detail and bumps `failureNonce`.
 */
export function applyFailure(state: AsyncRequestState, error: unknown): AsyncRequestState {
  const presentation: ApiErrorPresentation = presentApiError(error);
  return {
    ...state,
    status: LOAD_STATUS.Error,
    error: presentation.toast.detail,
    failureNonce: state.failureNonce + 1,
  };
}
