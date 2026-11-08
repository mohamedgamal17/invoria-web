import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { MessageService } from 'primeng/api';
import { catchError, exhaustMap, mergeMap, of, tap } from 'rxjs';

import { APP_ERROR_ACTIONS } from '../../../../shared/store/app-error.actions';
import { ProductsApiService } from '../../services/products-api.service';
import { PRODUCTS_LIST_ACTIONS } from '../products-list/products-list.actions';
import { PRODUCT_MUTATIONS_ACTIONS } from './products-mutations.actions';

/**
 * Store-owned create/update mutations for the product form page. Success
 * dispatches the local list-sync actions so the products list (provided on
 * the same shell route) folds the returned entity in without refetching;
 * API errors are presented by the global `AppErrorEffects`.
 */
@Injectable()
export class ProductsMutationsEffects {
  private readonly actions$ = inject(Actions);
  private readonly productsApi = inject(ProductsApiService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  readonly createProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PRODUCT_MUTATIONS_ACTIONS.createProduct),
      exhaustMap(({ request }) =>
        this.productsApi.createProduct(request).pipe(
          mergeMap((res) => {
            if (res.isSuccess && res.result) {
              return of(
                PRODUCT_MUTATIONS_ACTIONS.createProductSuccess({ product: res.result }),
                PRODUCTS_LIST_ACTIONS.productCreated({ product: res.result }),
              );
            }
            const error = res.error ?? new Error('Failed to create the product.');
            return of(
              PRODUCT_MUTATIONS_ACTIONS.createProductFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            );
          }),
          catchError((error: unknown) =>
            of(
              PRODUCT_MUTATIONS_ACTIONS.createProductFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            ),
          ),
        ),
      ),
    ),
  );

  /** Success presentation: toast on the shell `p-toast`, then land on the details page. */
  readonly presentCreateSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PRODUCT_MUTATIONS_ACTIONS.createProductSuccess),
        tap(({ product }) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Product created successfully.',
          });
          void this.router.navigate(['/products', product.id]);
        }),
      ),
    { dispatch: false },
  );

  readonly updateProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PRODUCT_MUTATIONS_ACTIONS.updateProduct),
      exhaustMap(({ id, request }) =>
        this.productsApi.updateProduct(id, request).pipe(
          mergeMap((res) => {
            if (res.isSuccess && res.result) {
              return of(
                PRODUCT_MUTATIONS_ACTIONS.updateProductSuccess({ product: res.result }),
                PRODUCTS_LIST_ACTIONS.productUpdated({ product: res.result }),
              );
            }
            const error = res.error ?? new Error('Failed to update the product.');
            return of(
              PRODUCT_MUTATIONS_ACTIONS.updateProductFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            );
          }),
          catchError((error: unknown) =>
            of(
              PRODUCT_MUTATIONS_ACTIONS.updateProductFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            ),
          ),
        ),
      ),
    ),
  );

  /** Success presentation: toast on the shell `p-toast`, then land on the details page. */
  readonly presentUpdateSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PRODUCT_MUTATIONS_ACTIONS.updateProductSuccess),
        tap(({ product }) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Product updated successfully.',
          });
          void this.router.navigate(['/products', product.id]);
        }),
      ),
    { dispatch: false },
  );

  readonly deleteProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PRODUCT_MUTATIONS_ACTIONS.deleteProduct),
      exhaustMap(({ id }) =>
        this.productsApi.deleteProduct(id).pipe(
          mergeMap((res) => {
            if (res.isSuccess) {
              return of(
                PRODUCT_MUTATIONS_ACTIONS.deleteProductSuccess({ id }),
                PRODUCTS_LIST_ACTIONS.productDeleted({ id }),
              );
            }
            const error = res.error ?? new Error('Failed to delete the product.');
            return of(
              PRODUCT_MUTATIONS_ACTIONS.deleteProductFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            );
          }),
          catchError((error: unknown) =>
            of(
              PRODUCT_MUTATIONS_ACTIONS.deleteProductFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            ),
          ),
        ),
      ),
    ),
  );

  /** Success presentation: toast on the shell `p-toast`, then land on the products list. */
  readonly presentDeleteSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PRODUCT_MUTATIONS_ACTIONS.deleteProductSuccess),
        tap(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Product deleted successfully.',
          });
          void this.router.navigate(['/products']);
        }),
      ),
    { dispatch: false },
  );
}
