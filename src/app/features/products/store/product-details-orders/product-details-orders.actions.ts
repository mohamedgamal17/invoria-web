import { createAction, props } from '@ngrx/store';

import type {
  ProductOrderRowSummary,
  ProductOrdersAggregateSummary,
} from '../../models/product-order-summary';

/**
 * State module for the Orders tab of the product details page: the lazy tab
 * gate plus the product-level order summaries (all API calls live here, none in
 * panel components).
 */
export const PRODUCT_ORDERS_ACTIONS = {
  /** Marks the Orders tab as activated (UI click or `tab=orders` in the URL); the lazy-fetch gate. */
  ordersTabOpened: createAction('[Product Details Orders] Orders Tab Opened'),

  /** User-initiated refresh of the summaries (panel "Refresh" button). */
  reloadOrders: createAction('[Product Details Orders] Reload Orders'),

  /** Internal: the single fetch trigger; the reducer decides whether a request is needed. */
  loadOrders: createAction('[Product Details Orders] Load Orders'),

  loadOrdersSuccess: createAction(
    '[Product Details Orders] Load Orders Success',
    props<{
      productId: string;
      rows: ProductOrderRowSummary[];
      aggregate: ProductOrdersAggregateSummary;
    }>(),
  ),

  loadOrdersFailure: createAction(
    '[Product Details Orders] Load Orders Failure',
    props<{ error: unknown }>(),
  ),

  /** Clears the slice when another product is being loaded; carries the incoming id. */
  reset: createAction('[Product Details Orders] Reset', props<{ productId: string }>()),
} as const;
