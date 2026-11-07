import { createAction, props } from '@ngrx/store';

import type { OrdersListFilters } from '../../../orders/components/orders-filter-panel/orders-filter-panel.component';
import type { PagingInfo } from '../../../../core/models/paging';
import type { UiOrder } from '../../../orders/models/order-ui.model';

/**
 * State module for the orders tab of the customer details page:
 * URL-backed paging, filters, the lazy tab gate and the current API page of orders.
 */
export const CUSTOMER_ORDERS_ACTIONS = {
  /** Marks the Orders tab as activated (UI click or `tab=orders` in the URL); the lazy-fetch gate. */
  ordersTabOpened: createAction('[Customer Details Orders] Orders Tab Opened'),

  /** Paging values observed from the query (`page` 0-based index / `rows` page size); always concrete numbers. */
  setPagingFromUrl: createAction(
    '[Customer Details Orders] Set Paging From Url',
    props<{ pageIndex: number; pageSize: number }>(),
  ),

  /** User-initiated page/refresh change. */
  pageChange: createAction(
    '[Customer Details Orders] Page Change',
    props<{ pageIndex: number; pageSize: number }>(),
  ),

  /** Replaces all filters and resets paging to the first page. */
  filtersChange: createAction(
    '[Customer Details Orders] Filters Change',
    props<{ filters: OrdersListFilters }>(),
  ),

  /** Clears all filters and resets paging to the first page. */
  filtersClear: createAction('[Customer Details Orders] Filters Clear'),

  /** Internal: the single fetch trigger; the reducer decides whether a real request is needed. */
  loadOrders: createAction('[Customer Details Orders] Load Orders'),

  loadOrdersSuccess: createAction(
    '[Customer Details Orders] Load Orders Success',
    props<{ orders: UiOrder[]; info: PagingInfo }>(),
  ),

  loadOrdersFailure: createAction(
    '[Customer Details Orders] Load Orders Failure',
    props<{ error: unknown }>(),
  ),

  /** Clears the slice when another customer is being loaded; carries the incoming id. */
  reset: createAction('[Customer Details Orders] Reset', props<{ customerId: string }>()),
} as const;
