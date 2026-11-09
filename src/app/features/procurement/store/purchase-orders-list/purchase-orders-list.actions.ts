import { createAction, props } from '@ngrx/store';

import type { PagingInfo } from '../../../../core/models/paging';
import type { PurchaseOrder } from '../../models/purchase-order.entity';

/**
 * State module for the purchase orders list page:
 * URL-backed paging + number/status filters, and the current API page of purchase orders.
 */
export const PURCHASE_ORDERS_LIST_ACTIONS = {
  /** Paging/filter values observed from the list-route query (`page` 1-based / `pageSize` / `number` / `status`); always concrete values. */
  setQueryFromUrl: createAction(
    '[Purchase Orders List] Set Query From Url',
    props<{
      pageIndex: number;
      pageSize: number;
      numberFilter: string;
      statusFilter: number | null;
    }>(),
  ),

  /** Internal: the single fetch trigger; the reducer decides whether a real request is needed. */
  loadPurchaseOrders: createAction('[Purchase Orders List] Load Purchase Orders'),

  loadPurchaseOrdersSuccess: createAction(
    '[Purchase Orders List] Load Purchase Orders Success',
    props<{ purchaseOrders: PurchaseOrder[]; info: PagingInfo }>(),
  ),

  loadPurchaseOrdersFailure: createAction(
    '[Purchase Orders List] Load Purchase Orders Failure',
    props<{ error: unknown }>(),
  ),

  /** Local sync: a purchase order was updated via the API (details-page state transition); replace in place if present. */
  purchaseOrderUpdated: createAction(
    '[Purchase Orders List] Purchase Order Updated',
    props<{ purchaseOrder: PurchaseOrder }>(),
  ),
} as const;
