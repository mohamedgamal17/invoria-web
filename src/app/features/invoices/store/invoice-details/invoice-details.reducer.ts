import { createFeature, createReducer, on } from '@ngrx/store';

import {
  INITIAL_ASYNC_REQUEST_STATE,
  applyFailure,
  startLoading,
  type AsyncRequestState,
} from '../../../../shared/models/async-request-state';
import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { Invoice } from '../../models/invoice.entity';
import { INVOICE_DETAILS_ACTIONS } from './invoice-details.actions';

export const INVOICE_DETAILS_FEATURE_KEY = 'invoiceDetails';

export interface InvoiceDetailsState {
  invoiceId: string | null;
  invoice: Invoice | null;
  /** Zero-based index of the details tabs (overview / items). */
  activeTab: number;
  /** Load (initial fetch or refresh) request. */
  request: AsyncRequestState;
}

export const INVOICE_DETAILS_INITIAL_STATE: InvoiceDetailsState = {
  invoiceId: null,
  invoice: null,
  activeTab: 0,
  request: INITIAL_ASYNC_REQUEST_STATE,
};

export const invoiceDetailsReducer = createReducer(
  INVOICE_DETAILS_INITIAL_STATE,

  on(INVOICE_DETAILS_ACTIONS.loadInvoice, (state, { invoiceId }) => ({
    ...state,
    invoiceId,
    invoice: null,
    activeTab: state.invoiceId === invoiceId ? state.activeTab : 0,
    request: startLoading(state.request),
  })),

  // Background refresh of the same invoice: the entity stays visible while it
  // is being refetched (the retry affordance).
  on(INVOICE_DETAILS_ACTIONS.refreshInvoice, (state, { invoiceId }) =>
    invoiceId === state.invoiceId
      ? { ...state, request: startLoading(state.request) }
      : state,
  ),

  on(INVOICE_DETAILS_ACTIONS.loadInvoiceSuccess, (state, { invoice }) => ({
    ...state,
    invoice,
    request: { ...state.request, status: LOAD_STATUS.Loaded, error: null },
  })),

  on(INVOICE_DETAILS_ACTIONS.loadInvoiceFailure, (state, { error }) => ({
    ...state,
    invoice: null,
    request: applyFailure(state.request, error),
  })),

  on(INVOICE_DETAILS_ACTIONS.setActiveTab, (state, { activeTab }) =>
    activeTab === state.activeTab ? state : { ...state, activeTab },
  ),
);

export const invoiceDetailsFeature = createFeature({
  name: INVOICE_DETAILS_FEATURE_KEY,
  reducer: invoiceDetailsReducer,
});
