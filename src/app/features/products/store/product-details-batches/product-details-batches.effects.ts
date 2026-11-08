import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import {
  catchError,
  distinctUntilChanged,
  exhaustMap,
  filter,
  map,
  mergeMap,
  of,
  switchMap,
  withLatestFrom,
} from 'rxjs';

import { APP_ERROR_ACTIONS } from '../../../../shared/store/app-error.actions';
import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { CreateBatchRequest } from '../../../inventory/models/create-batch.request';
import type { ListBatchRequest } from '../../../inventory/models/list-batch.request';
import type { UpdateBatchRequest } from '../../../inventory/models/update-batch.request';
import { BatchesApiService } from '../../../inventory/services/batches-api.service';
import { PRODUCT_DETAILS_ACTIONS } from '../product-details/product-details.actions';
import { productDetailsSelectors } from '../product-details/product-details.selectors';
import { PRODUCT_BATCHES_ACTIONS } from './product-details-batches.actions';
import {
  productBatchesFeature,
  type ProductBatchesState,
} from './product-details-batches.reducer';

/**
 * Data-only effects for the product batches slice. The lazy tab gate lives in
 * the reducer (`batchesTabOpened`); error presentation is owned by the global
 * `AppErrorEffects`.
 */
@Injectable()
export class ProductBatchesEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly batchesApi = inject(BatchesApiService);

  /** A new `:id` is being loaded → clear the batches slice (including the tab gate) for the incoming product. */
  readonly resetOnProductLoad$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PRODUCT_DETAILS_ACTIONS.loadProduct),
      withLatestFrom(this.store.select(productBatchesFeature.selectProductId)),
      filter(([{ productId }, currentId]) => productId !== currentId),
      map(([{ productId }]) => PRODUCT_BATCHES_ACTIONS.reset({ productId })),
    ),
  );

  /** Funnel: every navigation/user change above becomes the single `Load Batches` trigger. */
  readonly prepareFetch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        PRODUCT_BATCHES_ACTIONS.batchesTabOpened,
        PRODUCT_BATCHES_ACTIONS.setPagingFromUrl,
        PRODUCT_BATCHES_ACTIONS.pageChange,
      ),
      map(() => PRODUCT_BATCHES_ACTIONS.loadBatches()),
    ),
  );

  /** The Batches tab was already open when the product entity arrived → (re)fetch now. */
  readonly prepareFetchOnProductRetrieved$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PRODUCT_DETAILS_ACTIONS.loadProductSuccess),
      withLatestFrom(this.store.select(productBatchesFeature.selectBatchesTabOpened)),
      filter(([, batchesTabOpened]) => batchesTabOpened),
      map(() => PRODUCT_BATCHES_ACTIONS.loadBatches()),
    ),
  );

  /** The fetch itself: the reducer decides (via `fetchedQuery`) whether a request went in
   *  flight, so the effect only wakes when it did; cancels superseding triggers via `switchMap`.
   *  Duplicate `Load Batches` copies around the same in-flight query (their reducer pass
   *  no-ops and keeps the same state references) are suppressed by the round identity. */
  readonly fetchBatches$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PRODUCT_BATCHES_ACTIONS.loadBatches),
      withLatestFrom(
        this.store.select(productBatchesFeature.selectProductDetailsBatchesState),
        this.store.select(productDetailsSelectors.selectProduct),
      ),
      filter(([, state, product]) => state.request.status === LOAD_STATUS.Loading && Boolean(product)),
      distinctUntilChanged((prevSource, nextSource) => sameFetchRound(prevSource[1], nextSource[1])),
      switchMap(([, state, product]) => this.executeFetch(state, product!.id)),
    ),
  );

  readonly createBatch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PRODUCT_BATCHES_ACTIONS.createBatch),
      withLatestFrom(this.store.select(productDetailsSelectors.selectProduct)),
      filter(([, product]) => Boolean(product)),
      exhaustMap(([{ payload }, product]) => {
        const request: CreateBatchRequest = {
          ProductId: product!.id,
          Quantity: payload.quantity,
          PurchasePrice: payload.purchasePrice,
        };
        return this.batchesApi.createBatch(request).pipe(
          mergeMap((res) => {
            if (res.isSuccess && res.result) {
              return of(PRODUCT_BATCHES_ACTIONS.createBatchSuccess({ batch: res.result }));
            }
            const error = res.error ?? new Error('Failed to create the batch.');
            return of(
              PRODUCT_BATCHES_ACTIONS.createBatchFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            );
          }),
          catchError((error: unknown) =>
            of(
              PRODUCT_BATCHES_ACTIONS.createBatchFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            ),
          ),
        );
      }),
    ),
  );

  readonly updateBatch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PRODUCT_BATCHES_ACTIONS.updateBatch),
      exhaustMap(({ id, payload }) => {
        const request: UpdateBatchRequest = {
          Quantity: payload.quantity,
          PurchasePrice: payload.purchasePrice,
        };
        return this.batchesApi.updateBatch(id, request).pipe(
          mergeMap((res) => {
            if (res.isSuccess && res.result) {
              return of(PRODUCT_BATCHES_ACTIONS.updateBatchSuccess({ batch: res.result }));
            }
            const error = res.error ?? new Error('Failed to update the batch.');
            return of(
              PRODUCT_BATCHES_ACTIONS.updateBatchFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            );
          }),
          catchError((error: unknown) =>
            of(
              PRODUCT_BATCHES_ACTIONS.updateBatchFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            ),
          ),
        );
      }),
    ),
  );

  /** After a batch mutation: refresh the current batches page and re-fetch the product
   *  aggregates (quantities) in the background — the entity stays visible. */
  readonly prepareSyncAfterSave$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PRODUCT_BATCHES_ACTIONS.createBatchSuccess, PRODUCT_BATCHES_ACTIONS.updateBatchSuccess),
      withLatestFrom(this.store.select(productBatchesFeature.selectProductId)),
      mergeMap(([, productId]) =>
        of(
          PRODUCT_BATCHES_ACTIONS.loadBatches(),
          PRODUCT_DETAILS_ACTIONS.refreshProduct({ productId }),
        ),
      ),
    ),
  );

  private executeFetch(state: ProductBatchesState, productId: string) {
    const request: ListBatchRequest = {
      ProductId: productId,
      Skip: state.pageIndex * state.pageSize,
      Length: state.pageSize,
    };
    return this.batchesApi.listBatches(request).pipe(
      mergeMap((res) => {
        if (res.isSuccess && res.result) {
          return of(
            PRODUCT_BATCHES_ACTIONS.loadBatchesSuccess({
              batches: res.result.data,
              info: res.result.info,
            }),
          );
        }
        const error = res.error ?? new Error('Failed to load the batches.');
        return of(
          PRODUCT_BATCHES_ACTIONS.loadBatchesFailure({ error }),
          APP_ERROR_ACTIONS.apiError({ error }),
        );
      }),
      catchError((error: unknown) =>
        of(
          PRODUCT_BATCHES_ACTIONS.loadBatchesFailure({ error }),
          APP_ERROR_ACTIONS.apiError({ error }),
        ),
      ),
    );
  }
}

/** Stable identity of one fetch round: a real start/failure creates new state references,
 *  while a no-oped duplicate `Load Batches` keeps the current ones untouched. */
function sameFetchRound(left: ProductBatchesState, right: ProductBatchesState): boolean {
  return left === right;
}
