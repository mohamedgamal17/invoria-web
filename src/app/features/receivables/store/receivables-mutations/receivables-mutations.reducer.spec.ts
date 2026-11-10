import { describe, expect, it } from 'vitest';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import { RECEIVABLES_MUTATIONS_ACTIONS } from './receivables-mutations.actions';
import {
  RECEIVABLES_MUTATIONS_INITIAL_STATE,
  receivablesMutationsReducer,
} from './receivables-mutations.reducer';

describe('receivablesMutationsReducer', () => {
  describe('settleReceivable', () => {
    it('starts loading the settle fragment', () => {
      const next = receivablesMutationsReducer(RECEIVABLES_MUTATIONS_INITIAL_STATE, {
        ...RECEIVABLES_MUTATIONS_ACTIONS.settleReceivable({ receivableId: 'rec_1', amount: 100 }),
      });
      expect(next.settleRequest.status).toBe(LOAD_STATUS.Loading);
      expect(next.settleRequest.error).toBeNull();
    });

    it('is a no-op while a settle request is already in flight (double-submit guard)', () => {
      const loading = receivablesMutationsReducer(RECEIVABLES_MUTATIONS_INITIAL_STATE, {
        ...RECEIVABLES_MUTATIONS_ACTIONS.settleReceivable({ receivableId: 'rec_1', amount: 100 }),
      });
      const next = receivablesMutationsReducer(loading, {
        ...RECEIVABLES_MUTATIONS_ACTIONS.settleReceivable({ receivableId: 'rec_1', amount: 100 }),
      });
      expect(next).toBe(loading);
    });
  });

  describe('settleReceivableSuccess', () => {
    it('marks the settle fragment loaded', () => {
      let state = receivablesMutationsReducer(RECEIVABLES_MUTATIONS_INITIAL_STATE, {
        ...RECEIVABLES_MUTATIONS_ACTIONS.settleReceivable({ receivableId: 'rec_1', amount: 100 }),
      });
      state = receivablesMutationsReducer(state, {
        ...RECEIVABLES_MUTATIONS_ACTIONS.settleReceivableSuccess({
          receivable: {
            id: 'rec_1',
            partyId: 'cus_1',
            sourceId: 'ord_1',
            amount: 500,
            outstandingAmount: 400,
            status: 10,
            settlements: [],
            createdAt: '2026-01-01T00:00:00.000Z',
          },
          amount: 100,
        }),
      });
      expect(state.settleRequest.status).toBe(LOAD_STATUS.Loaded);
      expect(state.settleRequest.error).toBeNull();
    });
  });

  describe('settleReceivableFailure', () => {
    it('applies the failure to the settle fragment', () => {
      let state = receivablesMutationsReducer(RECEIVABLES_MUTATIONS_INITIAL_STATE, {
        ...RECEIVABLES_MUTATIONS_ACTIONS.settleReceivable({ receivableId: 'rec_1', amount: 100 }),
      });
      state = receivablesMutationsReducer(state, {
        ...RECEIVABLES_MUTATIONS_ACTIONS.settleReceivableFailure({ error: new Error('boom') }),
      });
      expect(state.settleRequest.status).toBe(LOAD_STATUS.Error);
      expect(state.settleRequest.error).not.toBeNull();
      expect(state.settleRequest.failureNonce).toBe(1);
    });

    it('keeps the settle fragment independent across failures (retries bump the nonce)', () => {
      let state = receivablesMutationsReducer(RECEIVABLES_MUTATIONS_INITIAL_STATE, {
        ...RECEIVABLES_MUTATIONS_ACTIONS.settleReceivable({ receivableId: 'rec_1', amount: 100 }),
      });
      state = receivablesMutationsReducer(state, {
        ...RECEIVABLES_MUTATIONS_ACTIONS.settleReceivableFailure({ error: new Error('boom') }),
      });
      state = receivablesMutationsReducer(state, {
        ...RECEIVABLES_MUTATIONS_ACTIONS.settleReceivable({ receivableId: 'rec_1', amount: 100 }),
      });
      const next = receivablesMutationsReducer(state, {
        ...RECEIVABLES_MUTATIONS_ACTIONS.settleReceivableFailure({ error: new Error('boom 2') }),
      });
      expect(next.settleRequest.status).toBe(LOAD_STATUS.Error);
      expect(next.settleRequest.failureNonce).toBe(2);
    });
  });
});
