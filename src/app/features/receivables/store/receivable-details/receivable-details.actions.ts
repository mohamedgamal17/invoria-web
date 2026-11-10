import { createAction, props } from '@ngrx/store';

import type { Receivable } from '../../models/receivable.entity';
import type { ReceivableDetailsTab } from './receivable-details.reducer';

/** State module for the receivable details page: `receivable` + `activeTab` + settle modal visibility. */
export const RECEIVABLE_DETAILS_ACTIONS = {
  /** Triggered when the page loads (the `:id` route param). */
  loadReceivable: createAction(
    '[Receivable Details] Load Receivable',
    props<{ receivableId: string }>(),
  ),

  loadReceivableSuccess: createAction(
    '[Receivable Details] Load Receivable Success',
    props<{ receivable: Receivable }>(),
  ),

  loadReceivableFailure: createAction(
    '[Receivable Details] Load Receivable Failure',
    props<{ error: unknown }>(),
  ),

  setActiveTab: createAction(
    '[Receivable Details] Set Active Tab',
    props<{ activeTab: ReceivableDetailsTab }>(),
  ),

  /** Settle modal visibility is store-owned: it closes automatically on settle success. */
  openSettleModal: createAction('[Receivable Details] Open Settle Modal'),

  closeSettleModal: createAction('[Receivable Details] Close Settle Modal'),
} as const;
