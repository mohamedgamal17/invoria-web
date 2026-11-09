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
import type { ListPurchaseOrderRequest } from '../../models/list-purchase-order.request';
import { PurchaseOrdersApiService } from '../../services/purchase-orders-api.service';
import { PURCHASE_ORDERS_LIST_ACTIONS } from './purchase-orders-list.actions';
import {
  purchaseOrdersListFeature,
  type PurchaseOrdersListState,
} from './purchase-orders-list.reducer';

/**
 * Data-only effects for the purchase orders list slice. URL application lives in the
 * `store/purchase-orders-list-url` effects; error presentation is owned by the
 * global `AppErrorEffects`.
 */
@Injectable()
export class PurchaseOrdersListEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly purchaseOrdersApi = inject(PurchaseOrdersApiService);

  /** Funnel: the URL application becomes the single `Load Purchase Orders` trigger. */
  readonly prepareFetch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PURCHASE_ORDERS_LIST_ACTIONS.setQueryFromUrl),
      map(() => PURCHASE_ORDERS_LIST_ACTIONS.loadPurchaseOrders()),
    ),
  );

  /** The fetch itself: the reducer decides (via `fetchedQuery`) whether a request went in
   *  flight, so the effect only wakes when it did; cancels superseding triggers via `switchMap`.
   *  Duplicate `Load Purchase Orders` copies around the same in-flight query (their reducer pass
   *  no-ops and keeps the same state references) are suppressed by the round identity. */
  readonly fetchPurchaseOrders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PURCHASE_ORDERS_LIST_ACTIONS.loadPurchaseOrders),
      withLatestFrom(this.store.select(purchaseOrdersListFeature.selectPurchaseOrdersListState)),
      filter(([, state]) => state.request.status === LOAD_STATUS.Loading),
      distinctUntilChanged((prevSource, nextSource) =>
        sameFetchRound(prevSource[1], nextSource[1]),
      ),
      switchMap(([, state]) => this.executeFetch(state)),
    ),
  );

  private executeFetch(state: PurchaseOrdersListState) {
    const request: ListPurchaseOrderRequest = {
      Skip: state.pageIndex * state.pageSize,
      Length: state.pageSize,
      Number: state.numberFilter || null,
      IncludePurchaseItems: false,
      IncludeSupplier: true,
      ...(state.statusFilter != null ? { Status: state.statusFilter } : {}),
    };

    return this.purchaseOrdersApi.listPurchaseOrders(request).pipe(
      mergeMap((res) => {
        if (res.isSuccess && res.result) {
          return of(
            PURCHASE_ORDERS_LIST_ACTIONS.loadPurchaseOrdersSuccess({
              purchaseOrders: res.result.data,
              info: res.result.info,
            }),
          );
        }
        const error = res.error ?? new Error('Failed to load purchase orders.');
        return of(
          PURCHASE_ORDERS_LIST_ACTIONS.loadPurchaseOrdersFailure({ error }),
          APP_ERROR_ACTIONS.apiError({ error }),
        );
      }),
      catchError((error: unknown) =>
        of(
          PURCHASE_ORDERS_LIST_ACTIONS.loadPurchaseOrdersFailure({ error }),
          APP_ERROR_ACTIONS.apiError({ error }),
        ),
      ),
    );
  }
}

/** Stable identity of one fetch round: a real start/failure creates new state references,
 *  while a no-oped duplicate `Load Purchase Orders` keeps the current ones untouched. */
function sameFetchRound(left: PurchaseOrdersListState, right: PurchaseOrdersListState): boolean {
  return left === right;
}
