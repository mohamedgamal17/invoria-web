import { createSelector } from '@ngrx/store';

import { LOAD_STATUS } from '@invoria/utils';
import { invoiceDetailsFeature } from './invoice-details.reducer';

export const invoiceDetailsSelectors = {
  selectInvoiceId: invoiceDetailsFeature.selectInvoiceId,
  selectInvoice: invoiceDetailsFeature.selectInvoice,
  selectActiveTab: invoiceDetailsFeature.selectActiveTab,
  selectRequest: invoiceDetailsFeature.selectRequest,

  selectIsLoading: createSelector(
    invoiceDetailsFeature.selectRequest,
    (request) => request.status === LOAD_STATUS.Loading,
  ),

  selectError: createSelector(invoiceDetailsFeature.selectRequest, (request) => request.error),

  selectFailureNonce: createSelector(
    invoiceDetailsFeature.selectRequest,
    (request) => request.failureNonce,
  ),
} as const;
