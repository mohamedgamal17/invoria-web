import { createAction, props } from '@ngrx/store';

import type { PagingInfo } from '../../../../core/models/paging';
import type { UiOrder } from '../../models/order-ui.model';

/**
 * State module for the orders list page:
 * URL-backed paging + filters (`page` / `pageSize` / `q` / `status` /
 * `paymentStatus` / `paymentType`), and the current API page of orders.
 */
export const ORDERS_LIST_ACTIONS = {
  /** Paging/filter values observed from the list-route query; always concrete values. */
  setQueryFromUrl: createAction(
    '[Orders List] Set Query From Url',
    props<{
      pageIndex: number;
      pageSize: number;
      orderNumberFilter: string;
      statusFilter: number | null;
      paymentStatusFilter: number | null;
      paymentTypeFilter: number | null;
    }>(),
  ),

  /** Internal: the single fetch trigger; the reducer decides whether a real request is needed. */
  loadOrders: createAction('[Orders List] Load Orders'),

  loadOrdersSuccess: createAction(
    '[Orders List] Load Orders Success',
    props<{ orders: UiOrder[]; info: PagingInfo }>(),
  ),

  loadOrdersFailure: createAction(
    '[Orders List] Load Orders Failure',
    props<{ error: unknown }>(),
  ),

  /** Local sync: an order was created via the API (form page); prepend silently, no refetch. */
  orderCreated: createAction('[Orders List] Order Created', props<{ order: UiOrder }>()),

  /** Local sync: the order was accepted via the API (details page); replace in place if present. */
  orderAccepted: createAction('[Orders List] Order Accepted', props<{ order: UiOrder }>()),

  /** Local sync: revision was requested via the API (details page); replace in place if present. */
  orderRevisionRequested: createAction(
    '[Orders List] Order Revision Requested',
    props<{ order: UiOrder }>(),
  ),

  /** Local sync: the order was completed via the API (details page); replace in place if present. */
  orderCompleted: createAction('[Orders List] Order Completed', props<{ order: UiOrder }>()),

  /** Local sync: the order was cancelled via the API (details page); replace in place if present. */
  orderCancelled: createAction('[Orders List] Order Cancelled', props<{ order: UiOrder }>()),

  /** Local sync fallback: a direct API update (line-items/payment/returns/edit) refreshed this order. */
  orderUpdated: createAction('[Orders List] Order Updated', props<{ order: UiOrder }>()),

} as const;
