import { createSelector } from '@ngrx/store';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import { orderDetailsFeature } from './order-details.reducer';

export const orderDetailsSelectors = {
  selectOrderId: orderDetailsFeature.selectOrderId,
  selectOrder: orderDetailsFeature.selectOrder,
  selectActiveTab: orderDetailsFeature.selectActiveTab,
  selectRequest: orderDetailsFeature.selectRequest,
  selectSavingRequest: orderDetailsFeature.selectSavingRequest,
  selectPaymentRequest: orderDetailsFeature.selectPaymentRequest,
  selectLastAction: orderDetailsFeature.selectLastAction,
  selectSuccessNonce: orderDetailsFeature.selectSuccessNonce,
  selectPaymentSuccessNonce: orderDetailsFeature.selectPaymentSuccessNonce,

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

  selectIsPaymentSaving: createSelector(
    orderDetailsFeature.selectPaymentRequest,
    (request) => request.status === LOAD_STATUS.Loading,
  ),

  selectPaymentError: createSelector(
    orderDetailsFeature.selectPaymentRequest,
    (request) => request.error,
  ),

  selectPaymentFailureNonce: createSelector(
    orderDetailsFeature.selectPaymentRequest,
    (request) => request.failureNonce,
  ),
} as const;
