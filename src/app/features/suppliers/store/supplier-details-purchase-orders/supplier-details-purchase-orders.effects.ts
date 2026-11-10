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
import type { ListPurchaseOrderRequest } from '../../../procurement/models/list-purchase-order.request';
import { PurchaseOrdersApiService } from '../../../procurement/services/purchase-orders-api.service';
import { SUPPLIER_DETAILS_ACTIONS } from '../supplier-details/supplier-details.actions';
import { supplierDetailsSelectors } from '../supplier-details/supplier-details.selectors';
import { SUPPLIER_PURCHASE_ORDERS_ACTIONS } from './supplier-details-purchase-orders.actions';
import {
  supplierPurchaseOrdersFeature,
  type SupplierPurchaseOrdersState,
} from './supplier-details-purchase-orders.reducer';

/**
 * Data-only effects for the supplier purchase orders slice. The lazy tab gate
 * lives in the reducer (`purchaseOrdersTabOpened`); error presentation is owned
 * by the global `AppErrorEffects`.
 */
@Injectable()
export class SupplierPurchaseOrdersEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly purchaseOrdersApi = inject(PurchaseOrdersApiService);

  /** A new `:id` is being loaded → clear the purchase orders slice (including the tab gate) for the incoming supplier. */
  readonly resetOnSupplierLoad$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SUPPLIER_DETAILS_ACTIONS.loadSupplier),
      withLatestFrom(this.store.select(supplierPurchaseOrdersFeature.selectSupplierId)),
      filter(([{ supplierId }, currentId]) => supplierId !== currentId),
      map(([{ supplierId }]) => SUPPLIER_PURCHASE_ORDERS_ACTIONS.reset({ supplierId })),
    ),
  );

  /** Funnel: every navigation/user change above becomes the single `Load Purchase Orders` trigger. */
  readonly prepareFetch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        SUPPLIER_PURCHASE_ORDERS_ACTIONS.purchaseOrdersTabOpened,
        SUPPLIER_PURCHASE_ORDERS_ACTIONS.setPagingFromUrl,
        SUPPLIER_PURCHASE_ORDERS_ACTIONS.pageChange,
        SUPPLIER_PURCHASE_ORDERS_ACTIONS.filtersChange,
        SUPPLIER_PURCHASE_ORDERS_ACTIONS.filtersClear,
      ),
      map(() => SUPPLIER_PURCHASE_ORDERS_ACTIONS.loadPurchaseOrders()),
    ),
  );

  /** The Purchase Orders tab was already open when the supplier entity arrived → (re)fetch now. */
  readonly prepareFetchOnSupplierRetrieved$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SUPPLIER_DETAILS_ACTIONS.loadSupplierSuccess),
      withLatestFrom(
        this.store.select(supplierPurchaseOrdersFeature.selectPurchaseOrdersTabOpened),
      ),
      filter(([, purchaseOrdersTabOpened]) => purchaseOrdersTabOpened),
      map(() => SUPPLIER_PURCHASE_ORDERS_ACTIONS.loadPurchaseOrders()),
    ),
  );

  /** The fetch itself: the reducer decides (via `fetchedQuery`) whether a request went in
   *  flight, so the effect only wakes when it did; cancels superseding triggers via `switchMap`.
   *  Duplicate `Load Purchase Orders` copies around the same in-flight query (their reducer
   *  pass no-ops and keeps the same state references) are suppressed by the round identity. */
  readonly fetchSupplierPurchaseOrders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SUPPLIER_PURCHASE_ORDERS_ACTIONS.loadPurchaseOrders),
      withLatestFrom(
        this.store.select(supplierPurchaseOrdersFeature.selectSupplierDetailsPurchaseOrdersState),
        this.store.select(supplierDetailsSelectors.selectSupplier),
      ),
      filter(
        ([, state, supplier]) => state.request.status === LOAD_STATUS.Loading && Boolean(supplier),
      ),
      distinctUntilChanged((prevSource, nextSource) =>
        sameFetchRound(prevSource[1], nextSource[1]),
      ),
      switchMap(([, state, supplier]) => this.executeFetch(state, supplier!.id)),
    ),
  );

  private executeFetch(state: SupplierPurchaseOrdersState, supplierId: string) {
    const filters = state.filters;
    const request: ListPurchaseOrderRequest = {
      Skip: state.pageIndex * state.pageSize,
      Length: state.pageSize,
      SupplierId: supplierId,
      IncludePurchaseItems: false,
      IncludeSupplier: true,
      Number: filters.purchaseNumber.trim() || null,
    };
    if (filters.status != null) {
      request.Status = filters.status;
    }

    return this.purchaseOrdersApi.listPurchaseOrders(request).pipe(
      mergeMap((res) => {
        if (res.isSuccess && res.result) {
          return of(
            SUPPLIER_PURCHASE_ORDERS_ACTIONS.loadPurchaseOrdersSuccess({
              purchaseOrders: res.result.data,
              info: res.result.info,
            }),
          );
        }
        const error = res.error ?? new Error('Failed to load supplier purchase orders.');
        return of(
          SUPPLIER_PURCHASE_ORDERS_ACTIONS.loadPurchaseOrdersFailure({ error }),
          APP_ERROR_ACTIONS.apiError({ error }),
        );
      }),
      catchError((error: unknown) =>
        of(
          SUPPLIER_PURCHASE_ORDERS_ACTIONS.loadPurchaseOrdersFailure({ error }),
          APP_ERROR_ACTIONS.apiError({ error }),
        ),
      ),
    );
  }
}

/** Stable identity of one fetch round: a real start/failure creates new state references,
 *  while a no-oped duplicate `Load Purchase Orders` keeps the current ones untouched. */
function sameFetchRound(
  left: SupplierPurchaseOrdersState,
  right: SupplierPurchaseOrdersState,
): boolean {
  return left === right;
}
