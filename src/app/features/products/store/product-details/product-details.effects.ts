import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, mergeMap, of, switchMap } from 'rxjs';

import { APP_ERROR_ACTIONS } from '../../../../shared/store/app-error.actions';
import { ProductsApiService } from '../../services/products-api.service';
import { PRODUCT_DETAILS_ACTIONS } from './product-details.actions';

/** Data-only effects: success/failure branching. Presentation is owned by the global `AppErrorEffects`. */
@Injectable()
export class ProductDetailsEffects {
  private readonly actions$ = inject(Actions);
  private readonly productsApi = inject(ProductsApiService);

  /**
   * Fires when the page loads or navigates to another `:id` (`loadProduct`), or
   * on a background refresh (`refreshProduct`); `switchMap` keeps only the latest.
   */
  readonly loadProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PRODUCT_DETAILS_ACTIONS.loadProduct, PRODUCT_DETAILS_ACTIONS.refreshProduct),
      switchMap(({ productId }) =>
        this.productsApi.getProduct(productId).pipe(
          mergeMap((res) => {
            if (res.isSuccess && res.result) {
              return of(PRODUCT_DETAILS_ACTIONS.loadProductSuccess({ product: res.result }));
            }
            const error = res.error ?? new Error('Failed to load the product.');
            return of(
              PRODUCT_DETAILS_ACTIONS.loadProductFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            );
          }),
          catchError((error: unknown) =>
            of(
              PRODUCT_DETAILS_ACTIONS.loadProductFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            ),
          ),
        ),
      ),
    ),
  );
}
