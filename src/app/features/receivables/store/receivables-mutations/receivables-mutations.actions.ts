import { createAction, props } from '@ngrx/store';

import type { Receivable } from '../../models/receivable.entity';

/**
 * State module for the settle mutation on the receivable details page. Success
 * dispatches the local list-sync action `RECEIVABLES_LIST_ACTIONS.receivableUpdated`
 * (see `receivables-mutations.effects`) so the loaded list page syncs silently
 * without refetching; the details store folds the returned entity in.
 */
export const RECEIVABLES_MUTATIONS_ACTIONS = {
  /** Details-page settle confirmation: start a settle request. */
  settleReceivable: createAction(
    '[Receivables] Settle Receivable',
    props<{ receivableId: string; amount: number }>(),
  ),

  settleReceivableSuccess: createAction(
    '[Receivables] Settle Receivable Success',
    props<{ receivable: Receivable; amount: number }>(),
  ),

  settleReceivableFailure: createAction(
    '[Receivables] Settle Receivable Failure',
    props<{ error: unknown }>(),
  ),
} as const;
