import { createSelector } from '@ngrx/store';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import { purchaseOrderDetailsFeature } from './purchase-order-details.reducer';

export const purchaseOrderDetailsSelectors = {
  selectPurchaseOrderId: purchaseOrderDetailsFeature.selectPurchaseOrderId,
  selectPurchaseOrder: purchaseOrderDetailsFeature.selectPurchaseOrder,
  selectActiveTab: purchaseOrderDetailsFeature.selectActiveTab,
  selectProductNamesById: purchaseOrderDetailsFeature.selectProductNamesById,
  selectRequest: purchaseOrderDetailsFeature.selectRequest,

  selectIsLoading: createSelector(
    purchaseOrderDetailsFeature.selectRequest,
    (request) => request.status === LOAD_STATUS.Loading,
  ),

  selectError: createSelector(
    purchaseOrderDetailsFeature.selectRequest,
    (request) => request.error,
  ),
} as const;
