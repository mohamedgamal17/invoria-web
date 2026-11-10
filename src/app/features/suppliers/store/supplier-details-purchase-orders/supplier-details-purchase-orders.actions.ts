import { createAction, props } from '@ngrx/store';

import type { PurchaseOrdersListFilters } from '../../../procurement/components/purchase-orders-filter-panel/purchase-orders-filter-panel.component';
import type { PagingInfo } from '../../../../core/models/paging';
import type { PurchaseOrder } from '../../../procurement/models/purchase-order.entity';

/**
 * State module for the purchase orders tab of the supplier details page:
 * URL-backed paging, filters, the lazy tab gate and the current API page of purchase orders.
 */
export const SUPPLIER_PURCHASE_ORDERS_ACTIONS = {
  /** Marks the Purchase Orders tab as activated (UI click or `tab=purchase-orders` in the URL); the lazy-fetch gate. */
  purchaseOrdersTabOpened: createAction('[Supplier Purchase Orders] Purchase Orders Tab Opened'),

  /** Paging values observed from the query (`page` 0-based index / `rows` page size); always concrete numbers. */
  setPagingFromUrl: createAction(
    '[Supplier Purchase Orders] Set Paging From Url',
    props<{ pageIndex: number; pageSize: number }>(),
  ),

  /** User-initiated page/refresh change. */
  pageChange: createAction(
    '[Supplier Purchase Orders] Page Change',
    props<{ pageIndex: number; pageSize: number }>(),
  ),

  /** Replaces all filters and resets paging to the first page. */
  filtersChange: createAction(
    '[Supplier Purchase Orders] Filters Change',
    props<{ filters: PurchaseOrdersListFilters }>(),
  ),

  /** Clears all filters and resets paging to the first page. */
  filtersClear: createAction('[Supplier Purchase Orders] Filters Clear'),

  /** Internal: the single fetch trigger; the reducer decides whether a real request is needed. */
  loadPurchaseOrders: createAction('[Supplier Purchase Orders] Load Purchase Orders'),

  loadPurchaseOrdersSuccess: createAction(
    '[Supplier Purchase Orders] Load Purchase Orders Success',
    props<{ purchaseOrders: PurchaseOrder[]; info: PagingInfo }>(),
  ),

  loadPurchaseOrdersFailure: createAction(
    '[Supplier Purchase Orders] Load Purchase Orders Failure',
    props<{ error: unknown }>(),
  ),

  /** Clears the slice when another supplier is being loaded; carries the incoming id. */
  reset: createAction('[Supplier Purchase Orders] Reset', props<{ supplierId: string }>()),
} as const;
