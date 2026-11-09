import { createAction, props } from '@ngrx/store';

import type { PurchaseOrder } from '../../models/purchase-order.entity';
import type { PurchaseOrderDetailsTab } from './purchase-order-details.reducer';

/** State module for the purchase order details page basics: `purchaseOrder` + `activeTab` + line-label lookups. */
export const PURCHASE_ORDER_DETAILS_ACTIONS = {
  /** Triggered when the page loads (the `:id` route param). */
  loadPurchaseOrder: createAction(
    '[Purchase Order Details] Load Purchase Order',
    props<{ purchaseOrderId: string }>(),
  ),

  loadPurchaseOrderSuccess: createAction(
    '[Purchase Order Details] Load Purchase Order Success',
    props<{ purchaseOrder: PurchaseOrder }>(),
  ),

  loadPurchaseOrderFailure: createAction(
    '[Purchase Order Details] Load Purchase Order Failure',
    props<{ error: unknown }>(),
  ),

  setActiveTab: createAction(
    '[Purchase Order Details] Set Active Tab',
    props<{ activeTab: PurchaseOrderDetailsTab }>(),
  ),

  /** Catalog names resolved by the details effects for line items without an embedded `productName`. */
  productNamesResolved: createAction(
    '[Purchase Order Details] Product Names Resolved',
    props<{ names: ReadonlyMap<string, string> }>(),
  ),
} as const;
