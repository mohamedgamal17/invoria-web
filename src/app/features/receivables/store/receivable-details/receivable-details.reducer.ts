import { createFeature, createReducer, on } from '@ngrx/store';

import {
  INITIAL_ASYNC_REQUEST_STATE,
  applyFailure,
  startLoading,
  type AsyncRequestState,
} from '../../../../shared/models/async-request-state';
import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { Receivable } from '../../models/receivable.entity';
import { RECEIVABLES_MUTATIONS_ACTIONS } from '../receivables-mutations/receivables-mutations.actions';
import { RECEIVABLE_DETAILS_ACTIONS } from './receivable-details.actions';

export const RECEIVABLE_DETAILS_FEATURE_KEY = 'receivableDetails';

/** Tabs of the receivable details page. Values double as URL query slugs. */
export enum ReceivableDetailsTab {
  Overview = 'overview',
  Settlements = 'settlements',
}

export interface ReceivableDetailsState {
  receivableId: string | null;
  receivable: Receivable | null;
  activeTab: ReceivableDetailsTab;
  settleModalVisible: boolean;
  request: AsyncRequestState;
}

export const RECEIVABLE_DETAILS_INITIAL_STATE: ReceivableDetailsState = {
  receivableId: null,
  receivable: null,
  activeTab: ReceivableDetailsTab.Overview,
  settleModalVisible: false,
  request: INITIAL_ASYNC_REQUEST_STATE,
};

export const receivableDetailsReducer = createReducer(
  RECEIVABLE_DETAILS_INITIAL_STATE,

  on(RECEIVABLE_DETAILS_ACTIONS.loadReceivable, (state, { receivableId }) => ({
    ...state,
    receivableId,
    receivable: null,
    settleModalVisible: false,
    request: startLoading(state.request),
  })),

  on(RECEIVABLE_DETAILS_ACTIONS.loadReceivableSuccess, (state, { receivable }) => ({
    ...state,
    receivable,
    request: { ...state.request, status: LOAD_STATUS.Loaded, error: null },
  })),

  on(RECEIVABLE_DETAILS_ACTIONS.loadReceivableFailure, (state, { error }) => ({
    ...state,
    receivable: null,
    request: applyFailure(state.request, error),
  })),

  on(RECEIVABLE_DETAILS_ACTIONS.setActiveTab, (state, { activeTab }) =>
    activeTab === state.activeTab ? state : { ...state, activeTab },
  ),

  on(RECEIVABLE_DETAILS_ACTIONS.openSettleModal, (state) =>
    state.settleModalVisible ? state : { ...state, settleModalVisible: true },
  ),

  on(RECEIVABLE_DETAILS_ACTIONS.closeSettleModal, (state) =>
    state.settleModalVisible ? { ...state, settleModalVisible: false } : state,
  ),

  /**
   * Silent cross-slice sync: the held receivable was settled through the
   * mutations slice; the details store folds the returned entity in without a
   * refetch and closes the settle modal. Receivables the store is not holding
   * are ignored.
   */
  on(RECEIVABLES_MUTATIONS_ACTIONS.settleReceivableSuccess, (state, { receivable }) =>
    state.receivable !== null && state.receivable.id === receivable.id
      ? { ...state, receivable, settleModalVisible: false }
      : state,
  ),
);

export const receivableDetailsFeature = createFeature({
  name: RECEIVABLE_DETAILS_FEATURE_KEY,
  reducer: receivableDetailsReducer,
});
