import { createSelector } from '@ngrx/store';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import { receivableDetailsFeature } from './receivable-details.reducer';

export const receivableDetailsSelectors = {
  selectReceivableId: receivableDetailsFeature.selectReceivableId,
  selectReceivable: receivableDetailsFeature.selectReceivable,
  selectActiveTab: receivableDetailsFeature.selectActiveTab,
  selectSettleModalVisible: receivableDetailsFeature.selectSettleModalVisible,
  selectRequest: receivableDetailsFeature.selectRequest,

  selectIsLoading: createSelector(
    receivableDetailsFeature.selectRequest,
    (request) => request.status === LOAD_STATUS.Loading,
  ),

  selectError: createSelector(receivableDetailsFeature.selectRequest, (request) => request.error),

  selectFailureNonce: createSelector(
    receivableDetailsFeature.selectRequest,
    (request) => request.failureNonce,
  ),
} as const;
