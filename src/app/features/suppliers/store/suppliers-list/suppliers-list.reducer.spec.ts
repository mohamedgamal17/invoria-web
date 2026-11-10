import { describe, expect, it } from 'vitest';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { Supplier } from '../../models/supplier.entity';
import { SUPPLIERS_LIST_ACTIONS } from './suppliers-list.actions';
import {
  SUPPLIERS_LIST_INITIAL_STATE,
  suppliersListReducer,
  type SuppliersListState,
} from './suppliers-list.reducer';

const EMPTY_PAGE_INFO = { length: 0, skip: 0, totalCount: 0 };

const SUPPLIER: Supplier = {
  id: 'sup_1',
  name: 'Acme Supplies',
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('suppliersListReducer', () => {
  describe('setQueryFromUrl', () => {
    it('returns the same state object when the query already matches (name normalized)', () => {
      const primed: SuppliersListState = { ...SUPPLIERS_LIST_INITIAL_STATE, nameFilter: 'acme' };
      const next = suppliersListReducer(primed, {
        ...SUPPLIERS_LIST_ACTIONS.setQueryFromUrl({
          pageIndex: 0,
          pageSize: 25,
          nameFilter: ' acme ',
        }),
      });
      expect(next).toBe(primed);
      expect(next.nameFilter).toBe('acme');
    });

    it('replaces the query values on a real change', () => {
      const next = suppliersListReducer(SUPPLIERS_LIST_INITIAL_STATE, {
        ...SUPPLIERS_LIST_ACTIONS.setQueryFromUrl({
          pageIndex: 3,
          pageSize: 50,
          nameFilter: 'acme',
        }),
      });
      expect(next.pageIndex).toBe(3);
      expect(next.pageSize).toBe(50);
      expect(next.nameFilter).toBe('acme');
    });
  });

  describe('loadSuppliers (the state decides whether the API is called)', () => {
    it('starts loading on the first trigger', () => {
      const next = suppliersListReducer(SUPPLIERS_LIST_INITIAL_STATE, {
        ...SUPPLIERS_LIST_ACTIONS.loadSuppliers(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
      expect(next.fetchedQuery?.pageIndex).toBe(0);
      expect(next.fetchedQuery?.pageSize).toBe(25);
      expect(next.fetchedQuery?.nameFilter).toBe('');
    });

    it('does not start a second request for the same query once loaded', () => {
      let state = suppliersListReducer(SUPPLIERS_LIST_INITIAL_STATE, {
        ...SUPPLIERS_LIST_ACTIONS.loadSuppliers(),
      });
      state = suppliersListReducer(state, {
        ...SUPPLIERS_LIST_ACTIONS.loadSuppliersSuccess({ suppliers: [], info: EMPTY_PAGE_INFO }),
      });
      const next = suppliersListReducer(state, {
        ...SUPPLIERS_LIST_ACTIONS.loadSuppliers(),
      });
      expect(next).toBe(state);
      expect(next.request.status).toBe(LOAD_STATUS.Loaded);
    });

    it('does not restart an in-flight request for the same query', () => {
      let state = suppliersListReducer(SUPPLIERS_LIST_INITIAL_STATE, {
        ...SUPPLIERS_LIST_ACTIONS.loadSuppliers(),
      });
      const next = suppliersListReducer(state, {
        ...SUPPLIERS_LIST_ACTIONS.loadSuppliers(),
      });
      expect(next).toBe(state);
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });

    it('starts a new request when the query actually changed', () => {
      let state = suppliersListReducer(SUPPLIERS_LIST_INITIAL_STATE, {
        ...SUPPLIERS_LIST_ACTIONS.setQueryFromUrl({
          pageIndex: 0,
          pageSize: 25,
          nameFilter: 'acme',
        }),
      });
      state = suppliersListReducer(state, { ...SUPPLIERS_LIST_ACTIONS.loadSuppliers() });
      state = suppliersListReducer(state, {
        ...SUPPLIERS_LIST_ACTIONS.loadSuppliersSuccess({ suppliers: [], info: EMPTY_PAGE_INFO }),
      });
      state = suppliersListReducer(state, {
        ...SUPPLIERS_LIST_ACTIONS.setQueryFromUrl({
          pageIndex: 1,
          pageSize: 25,
          nameFilter: 'acme',
        }),
      });
      const next = suppliersListReducer(state, {
        ...SUPPLIERS_LIST_ACTIONS.loadSuppliers(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
      expect(next.fetchedQuery?.pageIndex).toBe(1);
    });

    it('is re-triggerable for the same query after a failure', () => {
      let state = suppliersListReducer(SUPPLIERS_LIST_INITIAL_STATE, {
        ...SUPPLIERS_LIST_ACTIONS.loadSuppliers(),
      });
      state = suppliersListReducer(state, {
        ...SUPPLIERS_LIST_ACTIONS.loadSuppliersFailure({ error: new Error('boom') }),
      });
      expect(state.fetchedQuery).toBeNull();
      expect(state.request.status).toBe(LOAD_STATUS.Error);
      const next = suppliersListReducer(state, {
        ...SUPPLIERS_LIST_ACTIONS.loadSuppliers(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });
  });

  describe('loadSuppliersSuccess', () => {
    it('stores suppliers and paging info and clears the error', () => {
      let state = suppliersListReducer(SUPPLIERS_LIST_INITIAL_STATE, {
        ...SUPPLIERS_LIST_ACTIONS.loadSuppliersFailure({ error: new Error('boom') }),
      });
      const next = suppliersListReducer(state, {
        ...SUPPLIERS_LIST_ACTIONS.loadSuppliersSuccess({
          suppliers: [SUPPLIER],
          info: { length: 25, skip: 0, totalCount: 1 },
        }),
      });
      expect(next.suppliers).toHaveLength(1);
      expect(next.info?.totalCount).toBe(1);
      expect(next.request.status).toBe(LOAD_STATUS.Loaded);
      expect(next.request.error).toBeNull();
    });
  });

  describe('loadSuppliersFailure', () => {
    it('clears the list, paging info and fetched query', () => {
      let state = suppliersListReducer(SUPPLIERS_LIST_INITIAL_STATE, {
        ...SUPPLIERS_LIST_ACTIONS.loadSuppliers(),
      });
      state = suppliersListReducer(state, {
        ...SUPPLIERS_LIST_ACTIONS.loadSuppliersSuccess({
          suppliers: [SUPPLIER],
          info: { length: 25, skip: 0, totalCount: 1 },
        }),
      });
      const next = suppliersListReducer(state, {
        ...SUPPLIERS_LIST_ACTIONS.loadSuppliersFailure({ error: new Error('boom') }),
      });
      expect(next.suppliers).toEqual([]);
      expect(next.info).toBeNull();
      expect(next.fetchedQuery).toBeNull();
      expect(next.request.status).toBe(LOAD_STATUS.Error);
    });
  });

  describe('supplierCreated (local sync, no refetch)', () => {
    const NEW_SUPPLIER: Supplier = {
      id: 'sup_2',
      name: 'Beta Supply Co',
      createdAt: '2026-02-01T00:00:00.000Z',
    };

    function loadedState(overrides: Partial<SuppliersListState> = {}): SuppliersListState {
      let state = suppliersListReducer(SUPPLIERS_LIST_INITIAL_STATE, {
        ...SUPPLIERS_LIST_ACTIONS.loadSuppliers(),
      });
      state = suppliersListReducer(state, {
        ...SUPPLIERS_LIST_ACTIONS.loadSuppliersSuccess({
          suppliers: [SUPPLIER],
          info: { length: 1, skip: 0, totalCount: 1 },
        }),
      });
      return { ...state, ...overrides };
    }

    it('prepends on top on the first page and silently bumps totalCount', () => {
      const state = loadedState();
      const next = suppliersListReducer(state, {
        ...SUPPLIERS_LIST_ACTIONS.supplierCreated({ supplier: NEW_SUPPLIER }),
      });
      expect(next.suppliers.map((supplier) => supplier.id)).toEqual(['sup_2', 'sup_1']);
      expect(next.info?.totalCount).toBe(2);
      expect(next.info?.length).toBe(2);
      expect(next.request).toBe(state.request);
      expect(next.fetchedQuery).toBe(state.fetchedQuery);
    });

    it('trims to pageSize when the page is full', () => {
      const full = Array.from({ length: 25 }, (_, index) => ({
        ...SUPPLIER,
        id: `sup_full_${index}`,
      }));
      const state = loadedState({
        suppliers: full,
        info: { length: 25, skip: 0, totalCount: 25 },
      });
      const next = suppliersListReducer(state, {
        ...SUPPLIERS_LIST_ACTIONS.supplierCreated({ supplier: NEW_SUPPLIER }),
      });
      expect(next.suppliers).toHaveLength(25);
      expect(next.suppliers[0].id).toBe('sup_2');
      expect(next.suppliers.some((supplier) => supplier.id === 'sup_full_24')).toBe(false);
      expect(next.info?.totalCount).toBe(26);
      expect(next.info?.length).toBe(25);
    });

    it('only bumps totalCount when not on the first page', () => {
      const state = loadedState({ pageIndex: 1 });
      const next = suppliersListReducer(state, {
        ...SUPPLIERS_LIST_ACTIONS.supplierCreated({ supplier: NEW_SUPPLIER }),
      });
      expect(next.suppliers).toBe(state.suppliers);
      expect(next.info?.totalCount).toBe(2);
    });

    it('only bumps totalCount when the name does not match the filter', () => {
      const state = loadedState({ nameFilter: 'acme' });
      const next = suppliersListReducer(state, {
        ...SUPPLIERS_LIST_ACTIONS.supplierCreated({ supplier: NEW_SUPPLIER }),
      });
      expect(next.suppliers).toBe(state.suppliers);
      expect(next.info?.totalCount).toBe(2);
    });

    it('prepends when the name matches the filter (case-insensitive)', () => {
      const state = loadedState({ nameFilter: 'beta' });
      const next = suppliersListReducer(state, {
        ...SUPPLIERS_LIST_ACTIONS.supplierCreated({ supplier: NEW_SUPPLIER }),
      });
      expect(next.suppliers[0].id).toBe('sup_2');
    });

    it('returns the same state when the page was never loaded', () => {
      const next = suppliersListReducer(SUPPLIERS_LIST_INITIAL_STATE, {
        ...SUPPLIERS_LIST_ACTIONS.supplierCreated({ supplier: NEW_SUPPLIER }),
      });
      expect(next).toBe(SUPPLIERS_LIST_INITIAL_STATE);
    });

    it('returns the same state for a duplicate supplier id', () => {
      const state = loadedState();
      const next = suppliersListReducer(state, {
        ...SUPPLIERS_LIST_ACTIONS.supplierCreated({ supplier: SUPPLIER }),
      });
      expect(next).toBe(state);
    });
  });

  describe('supplierUpdated (local sync, no refetch)', () => {
    const UPDATED_SUPPLIER: Supplier = { ...SUPPLIER, name: 'Acme Supplies Pro' };

    function loadedState(): SuppliersListState {
      let state = suppliersListReducer(SUPPLIERS_LIST_INITIAL_STATE, {
        ...SUPPLIERS_LIST_ACTIONS.loadSuppliers(),
      });
      state = suppliersListReducer(state, {
        ...SUPPLIERS_LIST_ACTIONS.loadSuppliersSuccess({
          suppliers: [SUPPLIER],
          info: { length: 1, skip: 0, totalCount: 1 },
        }),
      });
      return state;
    }

    it('replaces the supplier in place when it is on the current page', () => {
      const state = loadedState();
      const next = suppliersListReducer(state, {
        ...SUPPLIERS_LIST_ACTIONS.supplierUpdated({ supplier: UPDATED_SUPPLIER }),
      });
      expect(next.suppliers).toEqual([UPDATED_SUPPLIER]);
      expect(next.info?.totalCount).toBe(1);
      expect(next.request).toBe(state.request);
    });

    it('returns the same state when the supplier is not on the current page', () => {
      const state = loadedState();
      const other: Supplier = { ...UPDATED_SUPPLIER, id: 'sup_other' };
      const next = suppliersListReducer(state, {
        ...SUPPLIERS_LIST_ACTIONS.supplierUpdated({ supplier: other }),
      });
      expect(next).toBe(state);
    });

    it('returns the same state when the page was never loaded', () => {
      const next = suppliersListReducer(SUPPLIERS_LIST_INITIAL_STATE, {
        ...SUPPLIERS_LIST_ACTIONS.supplierUpdated({ supplier: UPDATED_SUPPLIER }),
      });
      expect(next).toBe(SUPPLIERS_LIST_INITIAL_STATE);
    });
  });
});
