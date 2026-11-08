import { createAction, props } from '@ngrx/store';

import type { CompleteOrderRequest } from '../../models/complete-order.request';
import type { UiOrder } from '../../models/order-ui.model';
import type { OrderTransitionAction } from '../../services/order-action.facade';

/** State module for the order details page: `order`, `activeTab`, load + transition-action requests. */
export const ORDER_DETAILS_ACTIONS = {
  /** Triggered when the page loads (the `:id` route param). */
  loadOrder: createAction('[Order Details] Load Order', props<{ orderId: string }>()),

  /**
   * Background re-fetch of the same `:id` (e.g. after a payment or return-tab
   * mutation changed the order aggregates). Keeps the loaded entity visible,
   * unlike `loadOrder`.
   */
  refreshOrder: createAction('[Order Details] Refresh Order', props<{ orderId: string }>()),

  loadOrderSuccess: createAction(
    '[Order Details] Load Order Success',
    props<{ order: UiOrder }>(),
  ),

  loadOrderFailure: createAction(
    '[Order Details] Load Order Failure',
    props<{ error: unknown }>(),
  ),

  setActiveTab: createAction(
    '[Order Details] Set Active Tab',
    props<{ activeTab: number }>(),
  ),

  /** Confirmed order transition (accept / requestRevision / complete / cancel) via the facade. */
  recordAction: createAction(
    '[Order Details] Record Action',
    props<{ action: OrderTransitionAction; orderId: string; body?: CompleteOrderRequest }>(),
  ),

  recordActionSuccess: createAction(
    '[Order Details] Record Action Success',
    props<{ action: OrderTransitionAction; order: UiOrder }>(),
  ),

  recordActionFailure: createAction(
    '[Order Details] Record Action Failure',
    props<{ error: unknown }>(),
  ),
} as const;
