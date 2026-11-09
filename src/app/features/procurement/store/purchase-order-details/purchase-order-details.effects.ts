import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable, catchError, forkJoin, map, mergeMap, of, switchMap } from 'rxjs';

import { APP_ERROR_ACTIONS } from '../../../../shared/store/app-error.actions';
import type { PurchaseOrder } from '../../models/purchase-order.entity';
import { ProductsApiService } from '../../../products/services/products-api.service';
import { PurchaseOrdersApiService } from '../../services/purchase-orders-api.service';
import { PURCHASE_ORDERS_MUTATIONS_ACTIONS } from '../purchase-orders-mutations/purchase-orders-mutations.actions';
import { PURCHASE_ORDER_DETAILS_ACTIONS } from './purchase-order-details.actions';
import { purchaseOrderDetailsFeature } from './purchase-order-details.reducer';

/**
 * Data-only effects for the purchase order details slice: entity fetch and
 * catalog-name resolution for line items. Presentation is owned by the global
 * `AppErrorEffects`.
 */
@Injectable()
export class PurchaseOrderDetailsEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly purchaseOrdersApi = inject(PurchaseOrdersApiService);
  private readonly productsApi = inject(ProductsApiService);

  /** Fires when the page loads or navigates to another `:id`; `switchMap` keeps only the latest. */
  readonly loadPurchaseOrder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PURCHASE_ORDER_DETAILS_ACTIONS.loadPurchaseOrder),
      switchMap(({ purchaseOrderId }) =>
        this.purchaseOrdersApi.getPurchaseOrder(purchaseOrderId).pipe(
          mergeMap((res) => {
            if (res.isSuccess && res.result) {
              return of(
                PURCHASE_ORDER_DETAILS_ACTIONS.loadPurchaseOrderSuccess({
                  purchaseOrder: res.result,
                }),
              );
            }
            const error = res.error ?? new Error('Failed to load the purchase order.');
            return of(
              PURCHASE_ORDER_DETAILS_ACTIONS.loadPurchaseOrderFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            );
          }),
          catchError((error: unknown) =>
            of(
              PURCHASE_ORDER_DETAILS_ACTIONS.loadPurchaseOrderFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            ),
          ),
        ),
      ),
    ),
  );

  /** Resolves missing line-item product names after a load or a transition (the
   *  returned entity may carry new items); stores the merged lookup map. */
  readonly resolveProductNames$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        PURCHASE_ORDER_DETAILS_ACTIONS.loadPurchaseOrderSuccess,
        PURCHASE_ORDERS_MUTATIONS_ACTIONS.transitionPurchaseOrderSuccess,
      ),
      switchMap(({ purchaseOrder }) => this.resolveNames(purchaseOrder)),
    ),
  );

  private resolveNames(purchaseOrder: PurchaseOrder) {
    const items = purchaseOrder.purchaseOrderItems ?? [];
    const uniqueIds = [...new Set(items.map((item) => item.productId))];
    const fromLines = new Map<string, string>();
    for (const productId of uniqueIds) {
      const line = items.find((item) => item.productId === productId);
      const name = line?.productName?.trim();
      if (name) {
        fromLines.set(productId, name);
      }
    }
    const toFetch = uniqueIds.filter((productId) => !fromLines.has(productId));
    if (toFetch.length === 0) {
      return of(PURCHASE_ORDER_DETAILS_ACTIONS.productNamesResolved({ names: fromLines }));
    }

    return forkJoin(
      toFetch.map((productId) =>
        this.productsApi.getProduct(productId).pipe(
          map((res) => {
            const name =
              res.isSuccess && res.result?.name?.trim() ? res.result.name.trim() : productId;
            return { productId, name };
          }),
          catchError(() => of({ productId, name: productId })),
        ),
      ),
    ).pipe(
      map((rows) => {
        const merged = new Map(fromLines);
        for (const { productId, name } of rows) {
          merged.set(productId, name);
        }
        return PURCHASE_ORDER_DETAILS_ACTIONS.productNamesResolved({ names: merged });
      }),
    );
  }
}
