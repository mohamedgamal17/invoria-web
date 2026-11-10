import { describe, expect, it } from 'vitest';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import { FinancialObligationStatus } from '../../models/receivable-status.enum';
import type { Receivable } from '../../models/receivable.entity';
import { RECEIVABLES_MUTATIONS_ACTIONS } from '../receivables-mutations/receivables-mutations.actions';
import { RECEIVABLE_DETAILS_ACTIONS } from './receivable-details.actions';
import {
  RECEIVABLE_DETAILS_INITIAL_STATE,
  receivableDetailsReducer,
  ReceivableDetailsTab,
} from './receivable-details.reducer';

const MOCK_RECEIVABLE: Receivable = {
  id: 'rec_1',
  partyId: 'cus_1',
  sourceId: 'ord_1',
  amount: 500,
  outstandingAmount: 300,
  status: FinancialObligationStatus.PartiallyPaid,
  settlements: [],
  createdAt: '2026-01-01T00:00:00.000Z',
};

/** Initial state with a loaded receivable. */
function loadedState(receivable: Receivable = MOCK_RECEIVABLE) {
  return receivableDetailsReducer(
    receivableDetailsReducer(RECEIVABLE_DETAILS_INITIAL_STATE, {
      ...RECEIVABLE_DETAILS_ACTIONS.loadReceivable({ receivableId: receivable.id }),
    }),
    { ...RECEIVABLE_DETAILS_ACTIONS.loadReceivableSuccess({ receivable }) },
  );
}

describe('receivableDetailsReducer', () => {
  describe('loadReceivable', () => {
    it('clears the previous entity, modal state and starts loading', () => {
      let state = loadedState();
      state = receivableDetailsReducer(state, {
        ...RECEIVABLE_DETAILS_ACTIONS.openSettleModal(),
      });
      const next = receivableDetailsReducer(state, {
        ...RECEIVABLE_DETAILS_ACTIONS.loadReceivable({ receivableId: 'rec_2' }),
      });
      expect(next.receivableId).toBe('rec_2');
      expect(next.receivable).toBeNull();
      expect(next.settleModalVisible).toBe(false);
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });
  });

  describe('loadReceivableSuccess/Failure', () => {
    it('stores the receivable and marks the request loaded', () => {
      let state = receivableDetailsReducer(RECEIVABLE_DETAILS_INITIAL_STATE, {
        ...RECEIVABLE_DETAILS_ACTIONS.loadReceivable({ receivableId: 'rec_1' }),
      });
      state = receivableDetailsReducer(state, {
        ...RECEIVABLE_DETAILS_ACTIONS.loadReceivableSuccess({ receivable: MOCK_RECEIVABLE }),
      });
      expect(state.receivable).toBe(MOCK_RECEIVABLE);
      expect(state.request.status).toBe(LOAD_STATUS.Loaded);
      expect(state.request.error).toBeNull();
    });

    it('clears the entity and applies the failure', () => {
      let state = loadedState();
      state = receivableDetailsReducer(state, {
        ...RECEIVABLE_DETAILS_ACTIONS.loadReceivableFailure({ error: new Error('boom') }),
      });
      expect(state.receivable).toBeNull();
      expect(state.request.status).toBe(LOAD_STATUS.Error);
      expect(state.request.error).not.toBeNull();
      expect(state.request.failureNonce).toBe(1);
    });
  });

  describe('setActiveTab', () => {
    it('no-ops the same tab', () => {
      const state = receivableDetailsReducer(loadedState(), {
        ...RECEIVABLE_DETAILS_ACTIONS.setActiveTab({ activeTab: ReceivableDetailsTab.Settlements }),
      });
      const next = receivableDetailsReducer(state, {
        ...RECEIVABLE_DETAILS_ACTIONS.setActiveTab({ activeTab: ReceivableDetailsTab.Settlements }),
      });
      expect(next).toBe(state);
    });

    it('switches the tab', () => {
      const next = receivableDetailsReducer(loadedState(), {
        ...RECEIVABLE_DETAILS_ACTIONS.setActiveTab({ activeTab: ReceivableDetailsTab.Settlements }),
      });
      expect(next.activeTab).toBe(ReceivableDetailsTab.Settlements);
    });
  });

  describe('settle modal visibility', () => {
    it('opens and closes the modal (no-op when already in the target state)', () => {
      let state = receivableDetailsReducer(RECEIVABLE_DETAILS_INITIAL_STATE, {
        ...RECEIVABLE_DETAILS_ACTIONS.openSettleModal(),
      });
      expect(state.settleModalVisible).toBe(true);
      const reOpened = receivableDetailsReducer(state, {
        ...RECEIVABLE_DETAILS_ACTIONS.openSettleModal(),
      });
      expect(reOpened).toBe(state);
      state = receivableDetailsReducer(state, {
        ...RECEIVABLE_DETAILS_ACTIONS.closeSettleModal(),
      });
      expect(state.settleModalVisible).toBe(false);
      const reClosed = receivableDetailsReducer(state, {
        ...RECEIVABLE_DETAILS_ACTIONS.closeSettleModal(),
      });
      expect(reClosed).toBe(state);
    });
  });

  describe('silent sync from the receivables-mutations slice', () => {
    it('folds a settled entity in without refetching and closes the modal', () => {
      let state = loadedState();
      state = receivableDetailsReducer(state, {
        ...RECEIVABLE_DETAILS_ACTIONS.openSettleModal(),
      });
      const settledReceivable = { ...MOCK_RECEIVABLE, outstandingAmount: 200 };
      const next = receivableDetailsReducer(state, {
        ...RECEIVABLES_MUTATIONS_ACTIONS.settleReceivableSuccess({
          receivable: settledReceivable,
          amount: 300,
        }),
      });
      expect(next.receivable).toEqual(settledReceivable);
      expect(next.settleModalVisible).toBe(false);
      expect(next.request.status).toBe(LOAD_STATUS.Loaded);
    });

    it('ignores settlements for receivables the store is not holding', () => {
      const state = loadedState();
      const other = { ...MOCK_RECEIVABLE, id: 'rec_2', outstandingAmount: 0 };
      const next = receivableDetailsReducer(state, {
        ...RECEIVABLES_MUTATIONS_ACTIONS.settleReceivableSuccess({
          receivable: other,
          amount: 300,
        }),
      });
      expect(next).toBe(state);
    });
  });
});
