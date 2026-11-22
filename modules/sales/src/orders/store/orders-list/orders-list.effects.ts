import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  mergeMap,
  of,
  switchMap,
  withLatestFrom,
} from 'rxjs';

import { APP_ERROR_ACTIONS } from '@invoria/utils';
import { LOAD_STATUS } from '@invoria/utils';
import { OrdersApiService } from '@invoria/sales/orders/services/orders-api.service';
import { orderToUiOrder } from '@invoria/sales/orders/models/order-ui.mapper';
import { ORDERS_LIST_ACTIONS } from './orders-list.actions';
import { ordersListFeature, type OrdersListState } from './orders-list.reducer';

/**
 * Data-only effects for the orders list slice. URL application lives in the
 * `store/orders-list-url` effects; error presentation is owned by the
 * global `AppErrorEffects`.
 */
@Injectable()
export class OrdersListEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly ordersApi = inject(OrdersApiService);

  /** Funnel: the URL application becomes the single `Load Orders` trigger. */
  readonly prepareFetch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ORDERS_LIST_ACTIONS.setQueryFromUrl),
      map(() => ORDERS_LIST_ACTIONS.loadOrders()),
    ),
  );

  /** The fetch itself: the reducer decides (via `fetchedQuery`) whether a request went in
   *  flight, so the effect only wakes when it did; cancels superseding triggers via `switchMap`.
   *  Duplicate `Load Orders` copies around the same in-flight query (their reducer pass
   *  no-ops and keeps the same state references) are suppressed by the round identity. */
  readonly fetchOrders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ORDERS_LIST_ACTIONS.loadOrders),
      withLatestFrom(this.store.select(ordersListFeature.selectOrdersListState)),
      filter(([, state]) => state.request.status === LOAD_STATUS.Loading),
      distinctUntilChanged((prevSource, nextSource) => sameFetchRound(prevSource[1], nextSource[1])),
      switchMap(([, state]) => this.executeFetch(state)),
    ),
  );

  private executeFetch(state: OrdersListState) {
    const request = {
      skip: state.pageIndex * state.pageSize,
      length: state.pageSize,
      includeOrderItems: true,
      orderNumber: state.orderNumberFilter || null,
      ...(state.statusFilter !== null ? { status: state.statusFilter } : {}),
      ...(state.paymentStatusFilter !== null
        ? { paymentStatus: state.paymentStatusFilter }
        : {}),
      ...(state.paymentTypeFilter !== null ? { paymentType: state.paymentTypeFilter } : {}),
    };

    return this.ordersApi.listOrders(request).pipe(
      mergeMap((response) => {
        if (response.isSuccess && response.result) {
          return of(
            ORDERS_LIST_ACTIONS.loadOrdersSuccess({
              orders: response.result.data.map(orderToUiOrder),
              info: response.result.info,
            }),
          );
        }
        const error = response.error ?? new Error('Failed to load orders.');
        return of(
          ORDERS_LIST_ACTIONS.loadOrdersFailure({ error }),
          APP_ERROR_ACTIONS.apiError({ error }),
        );
      }),
      catchError((error: unknown) =>
        of(
          ORDERS_LIST_ACTIONS.loadOrdersFailure({ error }),
          APP_ERROR_ACTIONS.apiError({ error }),
        ),
      ),
    );
  }
}

/** Stable identity of one fetch round: a real start/failure creates new state references,
 *  while a no-oped duplicate `Load Orders` keeps the current ones untouched. */
function sameFetchRound(left: OrdersListState, right: OrdersListState): boolean {
  return left === right;
}
