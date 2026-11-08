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

import { APP_ERROR_ACTIONS } from '../../../../shared/store/app-error.actions';
import { LOAD_STATUS } from '../../../../shared/models/load-status';
import { OrdersApiService } from '../../services/orders-api.service';
import { orderToUiOrder } from '../../models/order-ui.mapper';
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
      Skip: state.pageIndex * state.pageSize,
      Length: state.pageSize,
      IncludeOrderItems: true,
      OrderNumber: state.orderNumberFilter || null,
      ...(state.statusFilter !== null ? { Status: state.statusFilter } : {}),
      ...(state.paymentStatusFilter !== null
        ? { PaymentStatus: state.paymentStatusFilter }
        : {}),
      ...(state.paymentTypeFilter !== null ? { PaymentType: state.paymentTypeFilter } : {}),
    };

    return this.ordersApi.listOrders(request).pipe(
      mergeMap((res) => {
        if (res.isSuccess && res.result) {
          return of(
            ORDERS_LIST_ACTIONS.loadOrdersSuccess({
              orders: res.result.data.map(orderToUiOrder),
              info: res.result.info,
            }),
          );
        }
        const error = res.error ?? new Error('Failed to load orders.');
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
