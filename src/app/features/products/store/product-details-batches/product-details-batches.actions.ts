import { createAction, props } from '@ngrx/store';

import type { PagingInfo } from '../../../../core/models/paging';
import type { Batch, BatchFormSavePayload } from '../../../inventory/models/batch.entity';

/**
 * State module for the batches tab of the product details page:
 * URL-backed paging, the lazy tab gate, the current API page of batches and
 * the batch create/update mutations (all API calls live here, none in panel components).
 */
export const PRODUCT_BATCHES_ACTIONS = {
  /** Marks the Batches tab as activated (UI click or `tab=batches` in the URL); the lazy-fetch gate. */
  batchesTabOpened: createAction('[Product Details Batches] Batches Tab Opened'),

  /** Paging values observed from the query (`page` 1-based / `pageSize`); always concrete numbers. */
  setPagingFromUrl: createAction(
    '[Product Details Batches] Set Paging From Url',
    props<{ pageIndex: number; pageSize: number }>(),
  ),

  /** User-initiated page/rows change. */
  pageChange: createAction(
    '[Product Details Batches] Page Change',
    props<{ pageIndex: number; pageSize: number }>(),
  ),

  /** Internal: the single fetch trigger; the reducer decides whether a real request is needed. */
  loadBatches: createAction('[Product Details Batches] Load Batches'),

  loadBatchesSuccess: createAction(
    '[Product Details Batches] Load Batches Success',
    props<{ batches: Batch[]; info: PagingInfo }>(),
  ),

  loadBatchesFailure: createAction(
    '[Product Details Batches] Load Batches Failure',
    props<{ error: unknown }>(),
  ),

  /** Panel dialog submit for a NEW batch; the effect owns the product context when building the request. */
  createBatch: createAction(
    '[Product Details Batches] Create Batch',
    props<{ payload: BatchFormSavePayload }>(),
  ),

  createBatchSuccess: createAction(
    '[Product Details Batches] Create Batch Success',
    props<{ batch: Batch }>(),
  ),

  createBatchFailure: createAction(
    '[Product Details Batches] Create Batch Failure',
    props<{ error: unknown }>(),
  ),

  /** Panel dialog submit for an EXISTING batch. */
  updateBatch: createAction(
    '[Product Details Batches] Update Batch',
    props<{ id: string; payload: BatchFormSavePayload }>(),
  ),

  updateBatchSuccess: createAction(
    '[Product Details Batches] Update Batch Success',
    props<{ batch: Batch }>(),
  ),

  updateBatchFailure: createAction(
    '[Product Details Batches] Update Batch Failure',
    props<{ error: unknown }>(),
  ),

  /** Clears the slice when another product is being loaded; carries the incoming id. */
  reset: createAction('[Product Details Batches] Reset', props<{ productId: string }>()),
} as const;
