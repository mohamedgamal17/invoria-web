import { describe, expect, it } from 'vitest';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import { FinancialObligationStatus } from '../../models/receivable-status.enum';
import type { Receivable } from '../../models/receivable.entity';
import { RECEIVABLES_LIST_ACTIONS } from './receivables-list.actions';
import {
  RECEIVABLES_LIST_INITIAL_STATE,
  receivablesListReducer,
  type ReceivablesListState,
} from './receivables-list.reducer';

const EMPTY_PAGE_INFO = { length: 0, skip: 0, totalCount: 0 };

const RECEIVABLE: Receivable = {
  id: 'rec_1',
  partyId: 'cus_1',
  sourceId: 'ord_1',
  amount: 500,
  outstandingAmount: 300,
  status: FinancialObligationStatus.PartiallyPaid,
  settlements: [],
  createdAt: '2026-01-01T00:00:00.000Z',
};

const SETTLED_RECEIVABLE: Receivable = { ...RECEIVABLE, outstandingAmount: 200 };

function setQueryFromUrlAction(
  overrides: Partial<{
    pageIndex: number;
    pageSize: number;
    partyIdFilter: string;
    sourceIdFilter: string;
    isPaidFilter: boolean | null;
  }> = {},
) {
  return RECEIVABLES_LIST_ACTIONS.setQueryFromUrl({
    pageIndex: 0,
    pageSize: 25,
    partyIdFilter: '',
    sourceIdFilter: '',
    isPaidFilter: null,
    ...overrides,
  });
}

describe('receivablesListReducer', () => {
  describe('setQueryFromUrl', () => {
    it('returns the same state object when the query already matches (ids normalized)', () => {
      const primed: ReceivablesListState = {
        ...RECEIVABLES_LIST_INITIAL_STATE,
        partyIdFilter: 'cus_1',
        sourceIdFilter: 'ord_1',
      };
      const next = receivablesListReducer(
        primed,
        setQueryFromUrlAction({ partyIdFilter: ' cus_1 ', sourceIdFilter: ' ord_1 ' }),
      );
      expect(next).toBe(primed);
      expect(next.partyIdFilter).toBe('cus_1');
      expect(next.sourceIdFilter).toBe('ord_1');
    });

    it('replaces the query values on a real change', () => {
      const next = receivablesListReducer(
        RECEIVABLES_LIST_INITIAL_STATE,
        setQueryFromUrlAction({
          pageIndex: 3,
          pageSize: 50,
          partyIdFilter: 'cus_1',
          sourceIdFilter: 'ord_1',
          isPaidFilter: false,
        }),
      );
      expect(next.pageIndex).toBe(3);
      expect(next.pageSize).toBe(50);
      expect(next.partyIdFilter).toBe('cus_1');
      expect(next.sourceIdFilter).toBe('ord_1');
      expect(next.isPaidFilter).toBe(false);
    });
  });

  describe('loadReceivables (the state decides whether the API is called)', () => {
    it('starts loading on the first trigger', () => {
      const next = receivablesListReducer(RECEIVABLES_LIST_INITIAL_STATE, {
        ...RECEIVABLES_LIST_ACTIONS.loadReceivables(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
      expect(next.fetchedQuery?.pageIndex).toBe(0);
      expect(next.fetchedQuery?.pageSize).toBe(25);
      expect(next.fetchedQuery?.partyIdFilter).toBe('');
      expect(next.fetchedQuery?.sourceIdFilter).toBe('');
      expect(next.fetchedQuery?.isPaidFilter).toBeNull();
    });

    it('does not start a second request for the same query once loaded', () => {
      let state = receivablesListReducer(RECEIVABLES_LIST_INITIAL_STATE, {
        ...RECEIVABLES_LIST_ACTIONS.loadReceivables(),
      });
      state = receivablesListReducer(state, {
        ...RECEIVABLES_LIST_ACTIONS.loadReceivablesSuccess({
          receivables: [],
          info: EMPTY_PAGE_INFO,
        }),
      });
      const next = receivablesListReducer(state, {
        ...RECEIVABLES_LIST_ACTIONS.loadReceivables(),
      });
      expect(next).toBe(state);
      expect(next.request.status).toBe(LOAD_STATUS.Loaded);
    });

    it('does not restart an in-flight request for the same query', () => {
      let state = receivablesListReducer(RECEIVABLES_LIST_INITIAL_STATE, {
        ...RECEIVABLES_LIST_ACTIONS.loadReceivables(),
      });
      const next = receivablesListReducer(state, {
        ...RECEIVABLES_LIST_ACTIONS.loadReceivables(),
      });
      expect(next).toBe(state);
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });

    it('starts a new request when the query actually changed', () => {
      let state = receivablesListReducer(
        RECEIVABLES_LIST_INITIAL_STATE,
        setQueryFromUrlAction({ pageIndex: 1, partyIdFilter: 'cus_1' }),
      );
      state = receivablesListReducer(state, { ...RECEIVABLES_LIST_ACTIONS.loadReceivables() });
      state = receivablesListReducer(state, {
        ...RECEIVABLES_LIST_ACTIONS.loadReceivablesSuccess({
          receivables: [],
          info: EMPTY_PAGE_INFO,
        }),
      });
      state = receivablesListReducer(
        state,
        setQueryFromUrlAction({ pageIndex: 2, partyIdFilter: 'cus_1' }),
      );
      const next = receivablesListReducer(state, {
        ...RECEIVABLES_LIST_ACTIONS.loadReceivables(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
      expect(next.fetchedQuery?.pageIndex).toBe(2);
    });

    it('is re-triggerable for the same query after a failure', () => {
      let state = receivablesListReducer(RECEIVABLES_LIST_INITIAL_STATE, {
        ...RECEIVABLES_LIST_ACTIONS.loadReceivables(),
      });
      state = receivablesListReducer(state, {
        ...RECEIVABLES_LIST_ACTIONS.loadReceivablesFailure({ error: new Error('boom') }),
      });
      expect(state.fetchedQuery).toBeNull();
      expect(state.request.status).toBe(LOAD_STATUS.Error);
      const next = receivablesListReducer(state, {
        ...RECEIVABLES_LIST_ACTIONS.loadReceivables(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });
  });

  describe('loadReceivablesSuccess', () => {
    it('stores receivables and paging info and clears the error', () => {
      let state = receivablesListReducer(RECEIVABLES_LIST_INITIAL_STATE, {
        ...RECEIVABLES_LIST_ACTIONS.loadReceivablesFailure({ error: new Error('boom') }),
      });
      const next = receivablesListReducer(state, {
        ...RECEIVABLES_LIST_ACTIONS.loadReceivablesSuccess({
          receivables: [RECEIVABLE],
          info: { length: 25, skip: 0, totalCount: 1 },
        }),
      });
      expect(next.receivables).toHaveLength(1);
      expect(next.info?.totalCount).toBe(1);
      expect(next.request.status).toBe(LOAD_STATUS.Loaded);
      expect(next.request.error).toBeNull();
    });
  });

  describe('loadReceivablesFailure', () => {
    it('clears the list, paging info and fetched query', () => {
      let state = receivablesListReducer(RECEIVABLES_LIST_INITIAL_STATE, {
        ...RECEIVABLES_LIST_ACTIONS.loadReceivables(),
      });
      state = receivablesListReducer(state, {
        ...RECEIVABLES_LIST_ACTIONS.loadReceivablesSuccess({
          receivables: [RECEIVABLE],
          info: { length: 25, skip: 0, totalCount: 1 },
        }),
      });
      const next = receivablesListReducer(state, {
        ...RECEIVABLES_LIST_ACTIONS.loadReceivablesFailure({ error: new Error('boom') }),
      });
      expect(next.receivables).toEqual([]);
      expect(next.info).toBeNull();
      expect(next.fetchedQuery).toBeNull();
      expect(next.request.status).toBe(LOAD_STATUS.Error);
    });
  });

  describe('receivableUpdated (local sync, no refetch)', () => {
    function loadedState(overrides: Partial<ReceivablesListState> = {}): ReceivablesListState {
      let state = receivablesListReducer(RECEIVABLES_LIST_INITIAL_STATE, {
        ...RECEIVABLES_LIST_ACTIONS.loadReceivables(),
      });
      state = receivablesListReducer(state, {
        ...RECEIVABLES_LIST_ACTIONS.loadReceivablesSuccess({
          receivables: [RECEIVABLE],
          info: { length: 1, skip: 0, totalCount: 1 },
        }),
      });
      return { ...state, ...overrides };
    }

    it('replaces the settled receivable in place when it is on the current page', () => {
      const state = loadedState();
      const next = receivablesListReducer(state, {
        ...RECEIVABLES_LIST_ACTIONS.receivableUpdated({ receivable: SETTLED_RECEIVABLE }),
      });
      expect(next.receivables).toEqual([SETTLED_RECEIVABLE]);
      expect(next.info?.totalCount).toBe(1);
      expect(next.request).toBe(state.request);
      expect(next.fetchedQuery).toBe(state.fetchedQuery);
    });

    it('returns the same state when the receivable is not on the current page', () => {
      const state = loadedState();
      const other: Receivable = { ...SETTLED_RECEIVABLE, id: 'rec_other' };
      const next = receivablesListReducer(state, {
        ...RECEIVABLES_LIST_ACTIONS.receivableUpdated({ receivable: other }),
      });
      expect(next).toBe(state);
    });

    it('returns the same state when the page was never loaded', () => {
      const next = receivablesListReducer(RECEIVABLES_LIST_INITIAL_STATE, {
        ...RECEIVABLES_LIST_ACTIONS.receivableUpdated({ receivable: SETTLED_RECEIVABLE }),
      });
      expect(next).toBe(RECEIVABLES_LIST_INITIAL_STATE);
    });
  });
});
