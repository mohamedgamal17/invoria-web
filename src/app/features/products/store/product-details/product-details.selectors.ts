import { createSelector } from '@ngrx/store';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import { productDetailsFeature } from './product-details.reducer';

export const productDetailsSelectors = {
  selectProductId: productDetailsFeature.selectProductId,
  selectProduct: productDetailsFeature.selectProduct,
  selectActiveTab: productDetailsFeature.selectActiveTab,
  selectRequest: productDetailsFeature.selectRequest,

  selectIsLoading: createSelector(
    productDetailsFeature.selectRequest,
    (request) => request.status === LOAD_STATUS.Loading,
  ),

  selectError: createSelector(productDetailsFeature.selectRequest, (request) => request.error),

  selectFailureNonce: createSelector(
    productDetailsFeature.selectRequest,
    (request) => request.failureNonce,
  ),
} as const;
