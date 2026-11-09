import { createAction, props } from '@ngrx/store';

import type { Payable } from '../../models/payable.entity';

/**
 * State module for the settle mutation on the payable details page. Success
 * dispatches the local list-sync action `PAYABLES_LIST_ACTIONS.payableUpdated`
 * (see `payables-mutations.effects`) so the loaded list page syncs silently
 * without refetching; the details store folds the returned entity in.
 */
export const PAYABLES_MUTATIONS_ACTIONS = {
  /** Details-page settle confirmation: start a settle request. */
  settlePayable: createAction(
    '[Payables] Settle Payable',
    props<{ payableId: string; amount: number }>(),
  ),

  settlePayableSuccess: createAction(
    '[Payables] Settle Payable Success',
    props<{ payable: Payable; amount: number }>(),
  ),

  settlePayableFailure: createAction(
    '[Payables] Settle Payable Failure',
    props<{ error: unknown }>(),
  ),
} as const;
