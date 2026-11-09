import { createAction, props } from '@ngrx/store';

import type { PurchaseOrder } from '../../models/purchase-order.entity';
import type { PurchaseOrderTransitionAction } from '../../models/purchase-order-actions';

/**
 * State module for purchase order entity mutations. Currently owns the
 * details-page state transitions; form-page create/update will join the same
 * slice when that page migrates. Success actions funnel into
 * `PURCHASE_ORDERS_LIST_ACTIONS.purchaseOrderUpdated` (see
 * `purchase-orders-mutations.effects`) so the loaded list page syncs silently
 * without refetching, and `purchase-order-details` folds the returned entity
 * in place when it holds the same id.
 */
export const PURCHASE_ORDERS_MUTATIONS_ACTIONS = {
  /** Details-page workflow action accepted: start a transition request. */
  transitionPurchaseOrder: createAction(
    '[Purchase Orders] Transition Purchase Order',
    props<{ id: string; action: PurchaseOrderTransitionAction }>(),
  ),

  transitionPurchaseOrderSuccess: createAction(
    '[Purchase Orders] Transition Purchase Order Success',
    props<{ purchaseOrder: PurchaseOrder }>(),
  ),

  transitionPurchaseOrderFailure: createAction(
    '[Purchase Orders] Transition Purchase Order Failure',
    props<{ error: unknown }>(),
  ),
} as const;
