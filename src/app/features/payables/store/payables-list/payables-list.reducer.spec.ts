import { describe, expect, it } from 'vitest';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import { FinancialObligationStatus } from '../../models/payable-status.enum';
import type { Payable } from '../../models/payable.entity';
import { PAYABLES_LIST_ACTIONS } from './payables-list.actions';
import {
  PAYABLES_LIST_INITIAL_STATE,
  payablesListReducer,
  type PayablesListState,
} from './payables-list.reducer';

const EMPTY_PAGE_INFO = { length: 0, skip: 0, totalCount: 0 };

const PAYABLE: Payable = {
  id: 'pay_1',
  partyId: 'sup_1',
  sourceId: 'po_1',
  amount: 500,
  outstandingAmount: 300,
  status: FinancialObligationStatus.PartiallyPaid,
  settlements: [],
  createdAt: '2026-01-01T00:00:00.000Z',
};

const SETTLED_PAYABLE: Payable = { ...PAYABLE, outstandingAmount: 200 };

function setQueryFromUrlAction(overrides: Partial<{
  pageIndex: number;
  pageSize: number;
  supplierIdFilter: string;
  sourceIdFilter: string;
  isPaidFilter: boolean | null;
}> = {}) {
  return PAYABLES_LIST_ACTIONS.setQueryFromUrl({
    pageIndex: 0,
    pageSize: 25,
    supplierIdFilter: '',
    sourceIdFilter: '',
    isPaidFilter: null,
    ...overrides,
  });
}

describe('payablesListReducer', () => {
  describe('setQueryFromUrl', () => {
    it('returns the same state object when the query already matches (ids normalized)', () => {
      const primed: PayablesListState = {
        ...PAYABLES_LIST_INITIAL_STATE,
        supplierIdFilter: 'sup_1',
        sourceIdFilter: 'po_1',
      };
      const next = payablesListReducer(
        primed,
        setQueryFromUrlAction({ supplierIdFilter: ' sup_1 ', sourceIdFilter: ' po_1 ' }),
      );
      expect(next).toBe(primed);
      expect(next.supplierIdFilter).toBe('sup_1');
      expect(next.sourceIdFilter).toBe('po_1');
    });

    it('replaces the query values on a real change', () => {
      const next = payablesListReducer(
        PAYABLES_LIST_INITIAL_STATE,
        setQueryFromUrlAction({
          pageIndex: 3,
          pageSize: 50,
          supplierIdFilter: 'sup_1',
          sourceIdFilter: 'po_1',
          isPaidFilter: false,
        }),
      );
      expect(next.pageIndex).toBe(3);
      expect(next.pageSize).toBe(50);
      expect(next.supplierIdFilter).toBe('sup_1');
      expect(next.sourceIdFilter).toBe('po_1');
      expect(next.isPaidFilter).toBe(false);
    });
  });

  describe('loadPayables (the state decides whether the API is called)', () => {
    it('starts loading on the first trigger', () => {
      const next = payablesListReducer(PAYABLES_LIST_INITIAL_STATE, {
        ...PAYABLES_LIST_ACTIONS.loadPayables(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
      expect(next.fetchedQuery?.pageIndex).toBe(0);
      expect(next.fetchedQuery?.pageSize).toBe(25);
      expect(next.fetchedQuery?.supplierIdFilter).toBe('');
      expect(next.fetchedQuery?.sourceIdFilter).toBe('');
      expect(next.fetchedQuery?.isPaidFilter).toBeNull();
    });

    it('does not start a second request for the same query once loaded', () => {
      let state = payablesListReducer(PAYABLES_LIST_INITIAL_STATE, {
        ...PAYABLES_LIST_ACTIONS.loadPayables(),
      });
      state = payablesListReducer(state, {
        ...PAYABLES_LIST_ACTIONS.loadPayablesSuccess({ payables: [], info: EMPTY_PAGE_INFO }),
      });
      const next = payablesListReducer(state, {
        ...PAYABLES_LIST_ACTIONS.loadPayables(),
      });
      expect(next).toBe(state);
      expect(next.request.status).toBe(LOAD_STATUS.Loaded);
    });

    it('does not restart an in-flight request for the same query', () => {
      let state = payablesListReducer(PAYABLES_LIST_INITIAL_STATE, {
        ...PAYABLES_LIST_ACTIONS.loadPayables(),
      });
      const next = payablesListReducer(state, {
        ...PAYABLES_LIST_ACTIONS.loadPayables(),
      });
      expect(next).toBe(state);
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });

    it('starts a new request when the query actually changed', () => {
      let state = payablesListReducer(
        PAYABLES_LIST_INITIAL_STATE,
        setQueryFromUrlAction({ pageIndex: 1, supplierIdFilter: 'sup_1' }),
      );
      state = payablesListReducer(state, { ...PAYABLES_LIST_ACTIONS.loadPayables() });
      state = payablesListReducer(state, {
        ...PAYABLES_LIST_ACTIONS.loadPayablesSuccess({ payables: [], info: EMPTY_PAGE_INFO }),
      });
      state = payablesListReducer(
        state,
        setQueryFromUrlAction({ pageIndex: 2, supplierIdFilter: 'sup_1' }),
      );
      const next = payablesListReducer(state, {
        ...PAYABLES_LIST_ACTIONS.loadPayables(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
      expect(next.fetchedQuery?.pageIndex).toBe(2);
    });

    it('is re-triggerable for the same query after a failure', () => {
      let state = payablesListReducer(PAYABLES_LIST_INITIAL_STATE, {
        ...PAYABLES_LIST_ACTIONS.loadPayables(),
      });
      state = payablesListReducer(state, {
        ...PAYABLES_LIST_ACTIONS.loadPayablesFailure({ error: new Error('boom') }),
      });
      expect(state.fetchedQuery).toBeNull();
      expect(state.request.status).toBe(LOAD_STATUS.Error);
      const next = payablesListReducer(state, {
        ...PAYABLES_LIST_ACTIONS.loadPayables(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });
  });

  describe('loadPayablesSuccess', () => {
    it('stores payables and paging info and clears the error', () => {
      let state = payablesListReducer(PAYABLES_LIST_INITIAL_STATE, {
        ...PAYABLES_LIST_ACTIONS.loadPayablesFailure({ error: new Error('boom') }),
      });
      const next = payablesListReducer(state, {
        ...PAYABLES_LIST_ACTIONS.loadPayablesSuccess({
          payables: [PAYABLE],
          info: { length: 25, skip: 0, totalCount: 1 },
        }),
      });
      expect(next.payables).toHaveLength(1);
      expect(next.info?.totalCount).toBe(1);
      expect(next.request.status).toBe(LOAD_STATUS.Loaded);
      expect(next.request.error).toBeNull();
    });
  });

  describe('loadPayablesFailure', () => {
    it('clears the list, paging info and fetched query', () => {
      let state = payablesListReducer(PAYABLES_LIST_INITIAL_STATE, {
        ...PAYABLES_LIST_ACTIONS.loadPayables(),
      });
      state = payablesListReducer(state, {
        ...PAYABLES_LIST_ACTIONS.loadPayablesSuccess({
          payables: [PAYABLE],
          info: { length: 25, skip: 0, totalCount: 1 },
        }),
      });
      const next = payablesListReducer(state, {
        ...PAYABLES_LIST_ACTIONS.loadPayablesFailure({ error: new Error('boom') }),
      });
      expect(next.payables).toEqual([]);
      expect(next.info).toBeNull();
      expect(next.fetchedQuery).toBeNull();
      expect(next.request.status).toBe(LOAD_STATUS.Error);
    });
  });

  describe('payableUpdated (local sync, no refetch)', () => {
    function loadedState(overrides: Partial<PayablesListState> = {}): PayablesListState {
      let state = payablesListReducer(PAYABLES_LIST_INITIAL_STATE, {
        ...PAYABLES_LIST_ACTIONS.loadPayables(),
      });
      state = payablesListReducer(state, {
        ...PAYABLES_LIST_ACTIONS.loadPayablesSuccess({
          payables: [PAYABLE],
          info: { length: 1, skip: 0, totalCount: 1 },
        }),
      });
      return { ...state, ...overrides };
    }

    it('replaces the settled payable in place when it is on the current page', () => {
      const state = loadedState();
      const next = payablesListReducer(state, {
        ...PAYABLES_LIST_ACTIONS.payableUpdated({ payable: SETTLED_PAYABLE }),
      });
      expect(next.payables).toEqual([SETTLED_PAYABLE]);
      expect(next.info?.totalCount).toBe(1);
      expect(next.request).toBe(state.request);
      expect(next.fetchedQuery).toBe(state.fetchedQuery);
    });

    it('returns the same state when the payable is not on the current page', () => {
      const state = loadedState();
      const other: Payable = { ...SETTLED_PAYABLE, id: 'pay_other' };
      const next = payablesListReducer(state, {
        ...PAYABLES_LIST_ACTIONS.payableUpdated({ payable: other }),
      });
      expect(next).toBe(state);
    });

    it('returns the same state when the page was never loaded', () => {
      const next = payablesListReducer(PAYABLES_LIST_INITIAL_STATE, {
        ...PAYABLES_LIST_ACTIONS.payableUpdated({ payable: SETTLED_PAYABLE }),
      });
      expect(next).toBe(PAYABLES_LIST_INITIAL_STATE);
    });
  });
});
