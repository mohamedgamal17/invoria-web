import { createAction, props } from '@ngrx/store';

import type { Payable } from '../../models/payable.entity';
import type { PayableDetailsTab } from './payable-details.reducer';

/** State module for the payable details page: `payable` + `activeTab` + settle modal visibility. */
export const PAYABLE_DETAILS_ACTIONS = {
  /** Triggered when the page loads (the `:id` route param). */
  loadPayable: createAction('[Payable Details] Load Payable', props<{ payableId: string }>()),

  loadPayableSuccess: createAction(
    '[Payable Details] Load Payable Success',
    props<{ payable: Payable }>(),
  ),

  loadPayableFailure: createAction(
    '[Payable Details] Load Payable Failure',
    props<{ error: unknown }>(),
  ),

  setActiveTab: createAction(
    '[Payable Details] Set Active Tab',
    props<{ activeTab: PayableDetailsTab }>(),
  ),

  /** Settle modal visibility is store-owned: it closes automatically on settle success. */
  openSettleModal: createAction('[Payable Details] Open Settle Modal'),

  closeSettleModal: createAction('[Payable Details] Close Settle Modal'),
} as const;
