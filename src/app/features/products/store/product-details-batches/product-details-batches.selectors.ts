import { createSelector } from '@ngrx/store';

import { EMPTY_PAGING_INFO } from '../../../../core/models/paging';
import { LOAD_STATUS } from '../../../../shared/models/load-status';
import { productDetailsFeature } from '../product-details/product-details.reducer';
import { productDetailsSelectors } from '../product-details/product-details.selectors';
import { productBatchesFeature } from './product-details-batches.reducer';

export const productBatchesSelectors = {
  selectProductId: productBatchesFeature.selectProductId,
  selectBatchesTabOpened: productBatchesFeature.selectBatchesTabOpened,
  selectPageIndex: productBatchesFeature.selectPageIndex,
  selectPageSize: productBatchesFeature.selectPageSize,
  selectFetchedQuery: productBatchesFeature.selectFetchedQuery,
  selectBatches: productBatchesFeature.selectBatches,
  selectInfo: productBatchesFeature.selectInfo,
  selectRequest: productBatchesFeature.selectRequest,
  selectSaveRequest: productBatchesFeature.selectSaveRequest,

  selectIsLoading: createSelector(
    productBatchesFeature.selectRequest,
    (request) => request.status === LOAD_STATUS.Loading,
  ),

  selectIsSaving: createSelector(
    productBatchesFeature.selectSaveRequest,
    (request) => request.status === LOAD_STATUS.Loading,
  ),

  /** Save status for the dialog: `null` when idle so the panel only reacts to real rounds. */
  selectSaveStatus: createSelector(
    productBatchesFeature.selectSaveRequest,
    (request) => (request.status === LOAD_STATUS.Idle ? null : request.status),
  ),

  /** Paging info with a stable empty fallback so the paginator never binds `null`. */
  selectPaging: createSelector(productBatchesFeature.selectInfo, (info) => info ?? EMPTY_PAGING_INFO),

  /** `first` offset for the PrimeNG paginator: `pageIndex * pageSize`. */
  selectFirst: createSelector(
    productBatchesFeature.selectPageIndex,
    productBatchesFeature.selectPageSize,
    (pageIndex, pageSize) => pageIndex * pageSize,
  ),

  /** Cross-store read: the loaded product entity (request building needs its `id`). */
  selectProduct: productDetailsFeature.selectProduct,
  selectDetailsIsLoading: productDetailsSelectors.selectIsLoading,
} as const;
