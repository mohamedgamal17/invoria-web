import { createSelector } from '@ngrx/store';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import { orderDetailsFeature } from './order-details.reducer';

export const orderDetailsSelectors = {
  selectOrderId: orderDetailsFeature.selectOrderId,
  selectOrder: orderDetailsFeature.selectOrder,
  selectActiveTab: orderDetailsFeature.selectActiveTab,
  selectRequest: orderDetailsFeature.selectRequest,
  selectSavingRequest: orderDetailsFeature.selectSavingRequest,
  selectLastAction: orderDetailsFeature.selectLastAction,
  selectSuccessNonce: orderDetailsFeature.selectSuccessNonce,

  selectIsLoading: createSelector(
    orderDetailsFeature.selectRequest,
    (request) => request.status === LOAD_STATUS.Loading,
  ),

  selectError: createSelector(orderDetailsFeature.selectRequest, (request) => request.error),

  selectFailureNonce: createSelector(
    orderDetailsFeature.selectRequest,
    (request) => request.failureNonce,
  ),

  selectIsSaving: createSelector(
    orderDetailsFeature.selectSavingRequest,
    (request) => request.status === LOAD_STATUS.Loading,
  ),

  selectSavingError: createSelector(
    orderDetailsFeature.selectSavingRequest,
    (request) => request.error,
  ),

  selectSavingFailureNonce: createSelector(
    orderDetailsFeature.selectSavingRequest,
    (request) => request.failureNonce,
  ),
} as const;
