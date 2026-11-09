import { createAction, props } from '@ngrx/store';

import type { PagingInfo } from '../../../../core/models/paging';
import type { Invoice } from '../../models/invoice.entity';

/**
 * State module for the invoices list page:
 * URL-backed paging (`page` 1-based / `pageSize`) plus `customerId` / `orderId`
 * filters, and the current API page of invoices.
 */
export const INVOICES_LIST_ACTIONS = {
  /** Paging/filter values observed from the list-route query; always concrete values. */
  setQueryFromUrl: createAction(
    '[Invoices List] Set Query From Url',
    props<{
      pageIndex: number;
      pageSize: number;
      customerIdFilter: string;
      orderIdFilter: string;
    }>(),
  ),

  /** Internal: the single fetch trigger; the reducer decides whether a real request is needed. */
  loadInvoices: createAction('[Invoices List] Load Invoices'),

  loadInvoicesSuccess: createAction(
    '[Invoices List] Load Invoices Success',
    props<{ invoices: Invoice[]; info: PagingInfo }>(),
  ),

  loadInvoicesFailure: createAction(
    '[Invoices List] Load Invoices Failure',
    props<{ error: unknown }>(),
  ),
} as const;
