import { createAction, props } from '@ngrx/store';

import type { PagingInfo } from '../../../../core/models/paging';
import type { Receivable } from '../../models/receivable.entity';

/**
 * State module for the receivables list page:
 * URL-backed paging (`page`/`pageSize`) + filters (`partyId`/`sourceId`/
 * `isPaid`), and the current API page of receivables.
 */
export const RECEIVABLES_LIST_ACTIONS = {
  /** Paging/filter values observed from the list-route query; always concrete values. */
  setQueryFromUrl: createAction(
    '[Receivables List] Set Query From Url',
    props<{
      pageIndex: number;
      pageSize: number;
      partyIdFilter: string;
      sourceIdFilter: string;
      isPaidFilter: boolean | null;
    }>(),
  ),

  /** Internal: the single fetch trigger; the reducer decides whether a real request is needed. */
  loadReceivables: createAction('[Receivables List] Load Receivables'),

  loadReceivablesSuccess: createAction(
    '[Receivables List] Load Receivables Success',
    props<{ receivables: Receivable[]; info: PagingInfo }>(),
  ),

  loadReceivablesFailure: createAction(
    '[Receivables List] Load Receivables Failure',
    props<{ error: unknown }>(),
  ),

  /** Local sync: a receivable was settled via the API (details page); replace in place if present. */
  receivableUpdated: createAction(
    '[Receivables List] Receivable Updated',
    props<{ receivable: Receivable }>(),
  ),
} as const;
