import { createAction, props } from '@ngrx/store';

import type { PagingInfo } from '../../../../core/models/paging';
import type { Payable } from '../../models/payable.entity';

/**
 * State module for the payables list page:
 * URL-backed paging (`page`/`pageSize`) + filters (`supplierId`/`sourceId`/
 * `isPaid`), and the current API page of enriched payables.
 */
export const PAYABLES_LIST_ACTIONS = {
  /** Paging/filter values observed from the list-route query; always concrete values. */
  setQueryFromUrl: createAction(
    '[Payables List] Set Query From Url',
    props<{
      pageIndex: number;
      pageSize: number;
      supplierIdFilter: string;
      sourceIdFilter: string;
      isPaidFilter: boolean | null;
    }>(),
  ),

  /** Internal: the single fetch trigger; the reducer decides whether a real request is needed. */
  loadPayables: createAction('[Payables List] Load Payables'),

  loadPayablesSuccess: createAction(
    '[Payables List] Load Payables Success',
    props<{ payables: Payable[]; info: PagingInfo }>(),
  ),

  loadPayablesFailure: createAction(
    '[Payables List] Load Payables Failure',
    props<{ error: unknown }>(),
  ),

  /** Local sync: a payable was settled via the API (details page); replace in place if present. */
  payableUpdated: createAction('[Payables List] Payable Updated', props<{ payable: Payable }>()),
} as const;
