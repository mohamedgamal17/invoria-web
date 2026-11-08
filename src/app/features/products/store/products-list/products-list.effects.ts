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
import type { ListProductRequest } from '../../models/list-product.request';
import { ProductsApiService } from '../../services/products-api.service';
import { PRODUCTS_LIST_ACTIONS } from './products-list.actions';
import {
  productsListFeature,
  type ProductsListState,
} from './products-list.reducer';

/**
 * Data-only effects for the products list slice. URL application lives in the
 * `store/products-list-url` effects; error presentation is owned by the
 * global `AppErrorEffects`.
 */
@Injectable()
export class ProductsListEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly productsApi = inject(ProductsApiService);

  /** Funnel: the URL application becomes the single `Load Products` trigger. */
  readonly prepareFetch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PRODUCTS_LIST_ACTIONS.setQueryFromUrl),
      map(() => PRODUCTS_LIST_ACTIONS.loadProducts()),
    ),
  );

  /** The fetch itself: the reducer decides (via `fetchedQuery`) whether a request went in
   *  flight, so the effect only wakes when it did; cancels superseding triggers via `switchMap`.
   *  Duplicate `Load Products` copies around the same in-flight query (their reducer pass
   *  no-ops and keeps the same state references) are suppressed by the round identity. */
  readonly fetchProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PRODUCTS_LIST_ACTIONS.loadProducts),
      withLatestFrom(this.store.select(productsListFeature.selectProductsListState)),
      filter(([, state]) => state.request.status === LOAD_STATUS.Loading),
      distinctUntilChanged((prevSource, nextSource) => sameFetchRound(prevSource[1], nextSource[1])),
      switchMap(([, state]) => this.executeFetch(state)),
    ),
  );

  private executeFetch(state: ProductsListState) {
    const request: ListProductRequest = {
      Skip: state.pageIndex * state.pageSize,
      Length: state.pageSize,
      ...(state.nameFilter ? { Name: state.nameFilter } : {}),
    };

    return this.productsApi.listProducts(request).pipe(
      mergeMap((res) => {
        if (res.isSuccess && res.result) {
          return of(
            PRODUCTS_LIST_ACTIONS.loadProductsSuccess({
              products: res.result.data,
              info: res.result.info,
            }),
          );
        }
        const error = res.error ?? new Error('Failed to load products.');
        return of(
          PRODUCTS_LIST_ACTIONS.loadProductsFailure({ error }),
          APP_ERROR_ACTIONS.apiError({ error }),
        );
      }),
      catchError((error: unknown) =>
        of(
          PRODUCTS_LIST_ACTIONS.loadProductsFailure({ error }),
          APP_ERROR_ACTIONS.apiError({ error }),
        ),
      ),
    );
  }
}

/** Stable identity of one fetch round: a real start/failure creates new state references,
 *  while a no-oped duplicate `Load Products` keeps the current ones untouched. */
function sameFetchRound(left: ProductsListState, right: ProductsListState): boolean {
  return left === right;
}
