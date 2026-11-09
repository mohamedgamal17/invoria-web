import { createFeature, createReducer, on } from '@ngrx/store';

import {
  INITIAL_ASYNC_REQUEST_STATE,
  applyFailure,
  startLoading,
  type AsyncRequestState,
} from '../../../../shared/models/async-request-state';
import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { Payable } from '../../models/payable.entity';
import { PAYABLES_MUTATIONS_ACTIONS } from '../payables-mutations/payables-mutations.actions';
import { PAYABLE_DETAILS_ACTIONS } from './payable-details.actions';

export const PAYABLE_DETAILS_FEATURE_KEY = 'payableDetails';

/** Tabs of the payable details page. Values double as URL query slugs. */
export enum PayableDetailsTab {
  Overview = 'overview',
  Settlements = 'settlements',
}

export interface PayableDetailsState {
  payableId: string | null;
  payable: Payable | null;
  activeTab: PayableDetailsTab;
  settleModalVisible: boolean;
  request: AsyncRequestState;
}

export const PAYABLE_DETAILS_INITIAL_STATE: PayableDetailsState = {
  payableId: null,
  payable: null,
  activeTab: PayableDetailsTab.Overview,
  settleModalVisible: false,
  request: INITIAL_ASYNC_REQUEST_STATE,
};

export const payableDetailsReducer = createReducer(
  PAYABLE_DETAILS_INITIAL_STATE,

  on(PAYABLE_DETAILS_ACTIONS.loadPayable, (state, { payableId }) => ({
    ...state,
    payableId,
    payable: null,
    settleModalVisible: false,
    request: startLoading(state.request),
  })),

  on(PAYABLE_DETAILS_ACTIONS.loadPayableSuccess, (state, { payable }) => ({
    ...state,
    payable,
    request: { ...state.request, status: LOAD_STATUS.Loaded, error: null },
  })),

  on(PAYABLE_DETAILS_ACTIONS.loadPayableFailure, (state, { error }) => ({
    ...state,
    payable: null,
    request: applyFailure(state.request, error),
  })),

  on(PAYABLE_DETAILS_ACTIONS.setActiveTab, (state, { activeTab }) =>
    activeTab === state.activeTab ? state : { ...state, activeTab },
  ),

  on(PAYABLE_DETAILS_ACTIONS.openSettleModal, (state) =>
    state.settleModalVisible ? state : { ...state, settleModalVisible: true },
  ),

  on(PAYABLE_DETAILS_ACTIONS.closeSettleModal, (state) =>
    state.settleModalVisible ? { ...state, settleModalVisible: false } : state,
  ),

  /**
   * Silent cross-slice sync: the held payable was settled through the
   * mutations slice; the details store folds the returned entity in without a
   * refetch and closes the settle modal. Payables the store is not holding
   * are ignored.
   */
  on(PAYABLES_MUTATIONS_ACTIONS.settlePayableSuccess, (state, { payable }) =>
    state.payable !== null && state.payable.id === payable.id
      ? { ...state, payable, settleModalVisible: false }
      : state,
  ),
);

export const payableDetailsFeature = createFeature({
  name: PAYABLE_DETAILS_FEATURE_KEY,
  reducer: payableDetailsReducer,
});
