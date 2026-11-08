import { createFeature, createReducer, on } from '@ngrx/store';

import {
  INITIAL_ASYNC_REQUEST_STATE,
  applyFailure,
  startLoading,
  type AsyncRequestState,
} from '../../../../shared/models/async-request-state';
import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { UiOrder } from '../../models/order-ui.model';
import type { OrderTransitionAction } from '../../services/order-action.facade';
import { ORDER_DETAILS_ACTIONS } from './order-details.actions';

export const ORDER_DETAILS_FEATURE_KEY = 'orderDetails';

export interface OrderDetailsState {
  orderId: string | null;
  order: UiOrder | null;
  /** Zero-based index of the details tabs (summary / lineItems / payment / returns). */
  activeTab: number;
  /** Load (initial fetch or refresh) request. */
  request: AsyncRequestState;
  /** Confirmed order-transition request (accept / requestRevision / complete / cancel). */
  savingRequest: AsyncRequestState;
  /** Transition action targeted by the current/last `recordAction`. */
  lastAction: OrderTransitionAction | null;
  /** Increments on each `recordActionSuccess` so the page can replay success presentation. */
  successNonce: number;
}

export const ORDER_DETAILS_INITIAL_STATE: OrderDetailsState = {
  orderId: null,
  order: null,
  activeTab: 0,
  request: INITIAL_ASYNC_REQUEST_STATE,
  savingRequest: INITIAL_ASYNC_REQUEST_STATE,
  lastAction: null,
  successNonce: 0,
};

export const orderDetailsReducer = createReducer(
  ORDER_DETAILS_INITIAL_STATE,

  on(ORDER_DETAILS_ACTIONS.loadOrder, (state, { orderId }) => ({
    ...state,
    orderId,
    order: null,
    activeTab: state.orderId === orderId ? state.activeTab : 0,
    request: startLoading(state.request),
  })),

  // Background refresh of the same order: the entity stays visible while the
  // aggregate values are being refetched.
  on(ORDER_DETAILS_ACTIONS.refreshOrder, (state, { orderId }) =>
    orderId === state.orderId
      ? { ...state, request: startLoading(state.request) }
      : state,
  ),

  on(ORDER_DETAILS_ACTIONS.loadOrderSuccess, (state, { order }) => ({
    ...state,
    order,
    request: { ...state.request, status: LOAD_STATUS.Loaded, error: null },
  })),

  on(ORDER_DETAILS_ACTIONS.loadOrderFailure, (state, { error }) => ({
    ...state,
    order: null,
    request: applyFailure(state.request, error),
  })),

  on(ORDER_DETAILS_ACTIONS.setActiveTab, (state, { activeTab }) =>
    activeTab === state.activeTab ? state : { ...state, activeTab },
  ),

  on(ORDER_DETAILS_ACTIONS.recordAction, (state, { action }) => ({
    ...state,
    lastAction: action,
    savingRequest: startLoading(state.savingRequest),
  })),

  // The returned entity replaces the loaded order in place: the details view
  // updates without a refetch (same fold as `product-details-batches` saves).
  on(ORDER_DETAILS_ACTIONS.recordActionSuccess, (state, { order }) => ({
    ...state,
    order,
    savingRequest: { ...state.savingRequest, status: LOAD_STATUS.Loaded, error: null },
    successNonce: state.successNonce + 1,
  })),

  on(ORDER_DETAILS_ACTIONS.recordActionFailure, (state, { error }) => ({
    ...state,
    savingRequest: applyFailure(state.savingRequest, error),
  })),
);

export const orderDetailsFeature = createFeature({
  name: ORDER_DETAILS_FEATURE_KEY,
  reducer: orderDetailsReducer,
});
