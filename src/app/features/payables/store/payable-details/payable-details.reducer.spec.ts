import { describe, expect, it } from 'vitest';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import { FinancialObligationStatus } from '../../models/payable-status.enum';
import type { Payable } from '../../models/payable.entity';
import { PAYABLES_MUTATIONS_ACTIONS } from '../payables-mutations/payables-mutations.actions';
import { PAYABLE_DETAILS_ACTIONS } from './payable-details.actions';
import {
  PAYABLE_DETAILS_INITIAL_STATE,
  payableDetailsReducer,
  PayableDetailsTab,
} from './payable-details.reducer';

const MOCK_PAYABLE: Payable = {
  id: 'pay_1',
  partyId: 'sup_1',
  sourceId: 'po_1',
  amount: 500,
  outstandingAmount: 300,
  status: FinancialObligationStatus.PartiallyPaid,
  settlements: [],
  createdAt: '2026-01-01T00:00:00.000Z',
};

/** Initial state with a loaded payable. */
function loadedState(payable: Payable = MOCK_PAYABLE) {
  return payableDetailsReducer(
    payableDetailsReducer(PAYABLE_DETAILS_INITIAL_STATE, {
      ...PAYABLE_DETAILS_ACTIONS.loadPayable({ payableId: payable.id }),
    }),
    { ...PAYABLE_DETAILS_ACTIONS.loadPayableSuccess({ payable }) },
  );
}

describe('payableDetailsReducer', () => {
  describe('loadPayable', () => {
    it('clears the previous entity, modal state and starts loading', () => {
      let state = loadedState();
      state = payableDetailsReducer(state, {
        ...PAYABLE_DETAILS_ACTIONS.openSettleModal(),
      });
      const next = payableDetailsReducer(state, {
        ...PAYABLE_DETAILS_ACTIONS.loadPayable({ payableId: 'pay_2' }),
      });
      expect(next.payableId).toBe('pay_2');
      expect(next.payable).toBeNull();
      expect(next.settleModalVisible).toBe(false);
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });
  });

  describe('loadPayableSuccess/Failure', () => {
    it('stores the payable and marks the request loaded', () => {
      let state = payableDetailsReducer(PAYABLE_DETAILS_INITIAL_STATE, {
        ...PAYABLE_DETAILS_ACTIONS.loadPayable({ payableId: 'pay_1' }),
      });
      state = payableDetailsReducer(state, {
        ...PAYABLE_DETAILS_ACTIONS.loadPayableSuccess({ payable: MOCK_PAYABLE }),
      });
      expect(state.payable).toBe(MOCK_PAYABLE);
      expect(state.request.status).toBe(LOAD_STATUS.Loaded);
      expect(state.request.error).toBeNull();
    });

    it('clears the entity and applies the failure', () => {
      let state = loadedState();
      state = payableDetailsReducer(state, {
        ...PAYABLE_DETAILS_ACTIONS.loadPayableFailure({ error: new Error('boom') }),
      });
      expect(state.payable).toBeNull();
      expect(state.request.status).toBe(LOAD_STATUS.Error);
      expect(state.request.error).not.toBeNull();
      expect(state.request.failureNonce).toBe(1);
    });
  });

  describe('setActiveTab', () => {
    it('no-ops the same tab', () => {
      const state = payableDetailsReducer(loadedState(), {
        ...PAYABLE_DETAILS_ACTIONS.setActiveTab({ activeTab: PayableDetailsTab.Settlements }),
      });
      const next = payableDetailsReducer(state, {
        ...PAYABLE_DETAILS_ACTIONS.setActiveTab({ activeTab: PayableDetailsTab.Settlements }),
      });
      expect(next).toBe(state);
    });

    it('switches the tab', () => {
      const next = payableDetailsReducer(loadedState(), {
        ...PAYABLE_DETAILS_ACTIONS.setActiveTab({ activeTab: PayableDetailsTab.Settlements }),
      });
      expect(next.activeTab).toBe(PayableDetailsTab.Settlements);
    });
  });

  describe('settle modal visibility', () => {
    it('opens and closes the modal (no-op when already in the target state)', () => {
      let state = payableDetailsReducer(PAYABLE_DETAILS_INITIAL_STATE, {
        ...PAYABLE_DETAILS_ACTIONS.openSettleModal(),
      });
      expect(state.settleModalVisible).toBe(true);
      const reOpened = payableDetailsReducer(state, {
        ...PAYABLE_DETAILS_ACTIONS.openSettleModal(),
      });
      expect(reOpened).toBe(state);
      state = payableDetailsReducer(state, {
        ...PAYABLE_DETAILS_ACTIONS.closeSettleModal(),
      });
      expect(state.settleModalVisible).toBe(false);
      const reClosed = payableDetailsReducer(state, {
        ...PAYABLE_DETAILS_ACTIONS.closeSettleModal(),
      });
      expect(reClosed).toBe(state);
    });
  });

  describe('silent sync from the payables-mutations slice', () => {
    it('folds a settled entity in without refetching and closes the modal', () => {
      let state = loadedState();
      state = payableDetailsReducer(state, {
        ...PAYABLE_DETAILS_ACTIONS.openSettleModal(),
      });
      const settledPayable = { ...MOCK_PAYABLE, outstandingAmount: 200 };
      const next = payableDetailsReducer(state, {
        ...PAYABLES_MUTATIONS_ACTIONS.settlePayableSuccess({
          payable: settledPayable,
          amount: 300,
        }),
      });
      expect(next.payable).toEqual(settledPayable);
      expect(next.settleModalVisible).toBe(false);
      expect(next.request.status).toBe(LOAD_STATUS.Loaded);
    });

    it('ignores settlements for payables the store is not holding', () => {
      const state = loadedState();
      const other = { ...MOCK_PAYABLE, id: 'pay_2', outstandingAmount: 0 };
      const next = payableDetailsReducer(state, {
        ...PAYABLES_MUTATIONS_ACTIONS.settlePayableSuccess({ payable: other, amount: 300 }),
      });
      expect(next).toBe(state);
    });
  });
});
