import { createSelector } from '@ngrx/store';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import { supplierDetailsFeature } from './supplier-details.reducer';

export const supplierDetailsSelectors = {
  selectSupplierId: supplierDetailsFeature.selectSupplierId,
  selectSupplier: supplierDetailsFeature.selectSupplier,
  selectActiveTab: supplierDetailsFeature.selectActiveTab,
  selectRequest: supplierDetailsFeature.selectRequest,

  selectIsLoading: createSelector(
    supplierDetailsFeature.selectRequest,
    (request) => request.status === LOAD_STATUS.Loading,
  ),

  selectError: createSelector(supplierDetailsFeature.selectRequest, (request) => request.error),

  selectFailureNonce: createSelector(
    supplierDetailsFeature.selectRequest,
    (request) => request.failureNonce,
  ),
} as const;
