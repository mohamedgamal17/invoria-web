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
import { getOrderStatusLabel } from '@invoria/sales';
import { summarizeProductOrders } from '@invoria/catalog/models/product-order-summary';
import { ProductOrdersLoaderService } from '@invoria/catalog/services/product-orders-loader.service';
import { PRODUCT_DETAILS_ACTIONS } from '../product-details/product-details.actions';
import { productDetailsSelectors } from '../product-details/product-details.selectors';
import { PRODUCT_ORDERS_ACTIONS } from './product-details-orders.actions';
import {
  productOrdersFeature,
  type ProductOrdersState,
} from './product-details-orders.reducer';

/**
 * Data-only effects for the product orders slice. The lazy tab gate lives in
 * the reducer (`ordersTabOpened`); error presentation is owned by the global
 * `AppErrorEffects`.
 */
@Injectable()
export class ProductOrdersEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly ordersLoader = inject(ProductOrdersLoaderService);

  /** A new `:id` is being loaded → clear the orders slice (including the tab gate). */
  readonly resetOnProductLoad$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PRODUCT_DETAILS_ACTIONS.loadProduct),
      withLatestFrom(this.store.select(productOrdersFeature.selectProductId)),
      filter(([{ productId }, currentId]) => productId !== currentId),
      map(([{ productId }]) => PRODUCT_ORDERS_ACTIONS.reset({ productId })),
    ),
  );

  /** Funnel: tab activation and the panel refresh both become the single `Load Orders` trigger. */
  readonly prepareFetch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PRODUCT_ORDERS_ACTIONS.ordersTabOpened, PRODUCT_ORDERS_ACTIONS.reloadOrders),
      map(() => PRODUCT_ORDERS_ACTIONS.loadOrders()),
    ),
  );

  /** The Orders tab was already open when the product entity arrived → (re)fetch now. */
  readonly prepareFetchOnProductRetrieved$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PRODUCT_DETAILS_ACTIONS.loadProductSuccess),
      withLatestFrom(this.store.select(productOrdersFeature.selectOrdersTabOpened)),
      filter(([, ordersTabOpened]) => ordersTabOpened),
      map(() => PRODUCT_ORDERS_ACTIONS.loadOrders()),
    ),
  );

  /** The fetch itself: the reducer decides (via `loadedProductId`/`request`) whether a
   *  request went in flight, so the effect only wakes when it did; a superseding trigger
   *  cancels the previous round through `switchMap`. */
  readonly fetchOrders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PRODUCT_ORDERS_ACTIONS.loadOrders),
      withLatestFrom(
        this.store.select(productOrdersFeature.selectProductDetailsOrdersState),
        this.store.select(productDetailsSelectors.selectProduct),
      ),
      filter(([, state, product]) => state.request.status === LOAD_STATUS.Loading && Boolean(product)),
      distinctUntilChanged((prevSource, nextSource) => prevSource[1] === nextSource[1]),
      switchMap(([, state]) => this.executeFetch(state)),
    ),
  );

  private executeFetch(state: ProductOrdersState) {
    return this.ordersLoader.loadAllOrdersWithItems().pipe(
      map((orders) => {
        const { rows, aggregate } = summarizeProductOrders(
          orders,
          state.productId,
          (order) => getOrderStatusLabel(order.status),
        );
        return PRODUCT_ORDERS_ACTIONS.loadOrdersSuccess({
          productId: state.productId,
          rows,
          aggregate,
        });
      }),
      catchError((error: unknown) =>
        of(
          PRODUCT_ORDERS_ACTIONS.loadOrdersFailure({ error }),
          APP_ERROR_ACTIONS.apiError({ error }),
        ),
      ),
    );
  }
}
