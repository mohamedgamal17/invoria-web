import { createSelector } from '@ngrx/store';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import { payableDetailsFeature } from './payable-details.reducer';

export const payableDetailsSelectors = {
  selectPayableId: payableDetailsFeature.selectPayableId,
  selectPayable: payableDetailsFeature.selectPayable,
  selectActiveTab: payableDetailsFeature.selectActiveTab,
  selectSettleModalVisible: payableDetailsFeature.selectSettleModalVisible,
  selectRequest: payableDetailsFeature.selectRequest,

  selectIsLoading: createSelector(
    payableDetailsFeature.selectRequest,
    (request) => request.status === LOAD_STATUS.Loading,
  ),

  selectError: createSelector(payableDetailsFeature.selectRequest, (request) => request.error),

  selectFailureNonce: createSelector(
    payableDetailsFeature.selectRequest,
    (request) => request.failureNonce,
  ),
} as const;
