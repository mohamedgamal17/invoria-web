import { createAction, props } from '@ngrx/store';

import type { Invoice } from '../../models/invoice.entity';

/**
 * State module for the invoice details page: `invoice`, `activeTab` and the
 * load request (the page is read-only, so no transition/saving requests).
 */
export const INVOICE_DETAILS_ACTIONS = {
  /** Triggered when the page loads (the `:id` route param). */
  loadInvoice: createAction('[Invoice Details] Load Invoice', props<{ invoiceId: string }>()),

  /**
   * Background re-fetch of the same `:id` (the retry button). Keeps the loaded
   * entity visible, unlike `loadInvoice`, which clears it first.
   */
  refreshInvoice: createAction('[Invoice Details] Refresh Invoice', props<{ invoiceId: string }>()),

  loadInvoiceSuccess: createAction(
    '[Invoice Details] Load Invoice Success',
    props<{ invoice: Invoice }>(),
  ),

  loadInvoiceFailure: createAction(
    '[Invoice Details] Load Invoice Failure',
    props<{ error: unknown }>(),
  ),

  setActiveTab: createAction(
    '[Invoice Details] Set Active Tab',
    props<{ activeTab: number }>(),
  ),
} as const;
