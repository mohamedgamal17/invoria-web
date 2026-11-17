import { createAction, props } from '@ngrx/store';

import type { CompleteOrderRequest } from '../../models/complete-order.request';
import type { UiOrder } from '../../models/order-ui.model';
import type { RecordOrderPaymentRequest } from '../../models/record-order-payment.request';
import type { OrderTransitionAction } from '../../services/order-action.facade';
import type { OrderDetailsTab } from './order-details.reducer';

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

  loadOrderSuccess: createAction('[Order Details] Load Order Success', props<{ order: UiOrder }>()),

  loadOrderFailure: createAction('[Order Details] Load Order Failure', props<{ error: unknown }>()),

  setActiveTab: createAction(
    '[Order Details] Set Active Tab',
    props<{ activeTab: OrderDetailsTab }>(),
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

  /** Validated record-payment submit from the payment tab (POST /orders/{id}/payments). */
  recordPayment: createAction(
    '[Order Details] Record Payment',
    props<{ orderId: string; body: RecordOrderPaymentRequest }>(),
  ),

  recordPaymentSuccess: createAction(
    '[Order Details] Record Payment Success',
    props<{ order: UiOrder }>(),
  ),

  recordPaymentFailure: createAction(
    '[Order Details] Record Payment Failure',
    props<{ error: unknown }>(),
  ),
} as const;
