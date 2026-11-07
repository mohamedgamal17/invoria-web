import { createSelector } from '@ngrx/store';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import { customerDetailsFeature } from './customer-details.reducer';

export const customerDetailsSelectors = {
  selectCustomerId: customerDetailsFeature.selectCustomerId,
  selectCustomer: customerDetailsFeature.selectCustomer,
  selectActiveTab: customerDetailsFeature.selectActiveTab,
  selectRequest: customerDetailsFeature.selectRequest,

  selectIsLoading: createSelector(
    customerDetailsFeature.selectRequest,
    (request) => request.status === LOAD_STATUS.Loading,
  ),

  selectError: createSelector(customerDetailsFeature.selectRequest, (request) => request.error),

  selectFailureNonce: createSelector(
    customerDetailsFeature.selectRequest,
    (request) => request.failureNonce,
  ),
} as const;
