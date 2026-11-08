import { describe, expect, it } from 'vitest';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { Customer } from '../../models/customer.entity';
import { CUSTOMERS_LIST_ACTIONS } from './customers-list.actions';
import {
  CUSTOMERS_LIST_INITIAL_STATE,
  customersListReducer,
  type CustomersListState,
} from './customers-list.reducer';

const EMPTY_PAGE_INFO = { length: 0, skip: 0, totalCount: 0 };

const CUSTOMER: Customer = {
  id: 'cust_1',
  name: 'Acme Corp',
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('customersListReducer', () => {
  describe('setQueryFromUrl', () => {
    it('returns the same state object when the query already matches (name normalized)', () => {
      const primed: CustomersListState = { ...CUSTOMERS_LIST_INITIAL_STATE, nameFilter: 'acme' };
      const next = customersListReducer(primed, {
        ...CUSTOMERS_LIST_ACTIONS.setQueryFromUrl({
          pageIndex: 0,
          pageSize: 25,
          nameFilter: ' acme ',
        }),
      });
      expect(next).toBe(primed);
      expect(next.nameFilter).toBe('acme');
    });

    it('replaces the query values on a real change', () => {
      const next = customersListReducer(CUSTOMERS_LIST_INITIAL_STATE, {
        ...CUSTOMERS_LIST_ACTIONS.setQueryFromUrl({
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

  describe('loadCustomers (the state decides whether the API is called)', () => {
    it('starts loading on the first trigger', () => {
      const next = customersListReducer(CUSTOMERS_LIST_INITIAL_STATE, {
        ...CUSTOMERS_LIST_ACTIONS.loadCustomers(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
      expect(next.fetchedQuery?.pageIndex).toBe(0);
      expect(next.fetchedQuery?.pageSize).toBe(25);
      expect(next.fetchedQuery?.nameFilter).toBe('');
    });

    it('does not start a second request for the same query once loaded', () => {
      let state = customersListReducer(CUSTOMERS_LIST_INITIAL_STATE, {
        ...CUSTOMERS_LIST_ACTIONS.loadCustomers(),
      });
      state = customersListReducer(state, {
        ...CUSTOMERS_LIST_ACTIONS.loadCustomersSuccess({ customers: [], info: EMPTY_PAGE_INFO }),
      });
      const next = customersListReducer(state, {
        ...CUSTOMERS_LIST_ACTIONS.loadCustomers(),
      });
      expect(next).toBe(state);
      expect(next.request.status).toBe(LOAD_STATUS.Loaded);
    });

    it('does not restart an in-flight request for the same query', () => {
      let state = customersListReducer(CUSTOMERS_LIST_INITIAL_STATE, {
        ...CUSTOMERS_LIST_ACTIONS.loadCustomers(),
      });
      const next = customersListReducer(state, {
        ...CUSTOMERS_LIST_ACTIONS.loadCustomers(),
      });
      expect(next).toBe(state);
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });

    it('starts a new request when the query actually changed', () => {
      let state = customersListReducer(CUSTOMERS_LIST_INITIAL_STATE, {
        ...CUSTOMERS_LIST_ACTIONS.setQueryFromUrl({
          pageIndex: 0,
          pageSize: 25,
          nameFilter: 'acme',
        }),
      });
      state = customersListReducer(state, { ...CUSTOMERS_LIST_ACTIONS.loadCustomers() });
      state = customersListReducer(state, {
        ...CUSTOMERS_LIST_ACTIONS.loadCustomersSuccess({ customers: [], info: EMPTY_PAGE_INFO }),
      });
      state = customersListReducer(state, {
        ...CUSTOMERS_LIST_ACTIONS.setQueryFromUrl({
          pageIndex: 1,
          pageSize: 25,
          nameFilter: 'acme',
        }),
      });
      const next = customersListReducer(state, {
        ...CUSTOMERS_LIST_ACTIONS.loadCustomers(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
      expect(next.fetchedQuery?.pageIndex).toBe(1);
    });

    it('is re-triggerable for the same query after a failure', () => {
      let state = customersListReducer(CUSTOMERS_LIST_INITIAL_STATE, {
        ...CUSTOMERS_LIST_ACTIONS.loadCustomers(),
      });
      state = customersListReducer(state, {
        ...CUSTOMERS_LIST_ACTIONS.loadCustomersFailure({ error: new Error('boom') }),
      });
      expect(state.fetchedQuery).toBeNull();
      expect(state.request.status).toBe(LOAD_STATUS.Error);
      const next = customersListReducer(state, {
        ...CUSTOMERS_LIST_ACTIONS.loadCustomers(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });
  });

  describe('loadCustomersSuccess', () => {
    it('stores customers and paging info and clears the error', () => {
      let state = customersListReducer(CUSTOMERS_LIST_INITIAL_STATE, {
        ...CUSTOMERS_LIST_ACTIONS.loadCustomersFailure({ error: new Error('boom') }),
      });
      const next = customersListReducer(state, {
        ...CUSTOMERS_LIST_ACTIONS.loadCustomersSuccess({
          customers: [{ id: 'cust_1', name: 'Acme Corp', createdAt: '2026-01-01T00:00:00.000Z' }],
          info: { length: 25, skip: 0, totalCount: 1 },
        }),
      });
      expect(next.customers).toHaveLength(1);
      expect(next.info?.totalCount).toBe(1);
      expect(next.request.status).toBe(LOAD_STATUS.Loaded);
      expect(next.request.error).toBeNull();
    });
  });

  describe('loadCustomersFailure', () => {
    it('clears the list, paging info and fetched query', () => {
      let state = customersListReducer(CUSTOMERS_LIST_INITIAL_STATE, {
        ...CUSTOMERS_LIST_ACTIONS.loadCustomers(),
      });
      state = customersListReducer(state, {
        ...CUSTOMERS_LIST_ACTIONS.loadCustomersSuccess({
          customers: [{ id: 'cust_1', name: 'Acme Corp', createdAt: '2026-01-01T00:00:00.000Z' }],
          info: { length: 25, skip: 0, totalCount: 1 },
        }),
      });
      const next = customersListReducer(state, {
        ...CUSTOMERS_LIST_ACTIONS.loadCustomersFailure({ error: new Error('boom') }),
      });
      expect(next.customers).toEqual([]);
      expect(next.info).toBeNull();
      expect(next.fetchedQuery).toBeNull();
      expect(next.request.status).toBe(LOAD_STATUS.Error);
    });
  });

  describe('customerCreated (local sync, no refetch)', () => {
    const NEW_CUSTOMER: Customer = {
      id: 'cust_2',
      name: 'Beta LLC',
      createdAt: '2026-02-01T00:00:00.000Z',
    };

    function loadedState(overrides: Partial<CustomersListState> = {}): CustomersListState {
      let state = customersListReducer(CUSTOMERS_LIST_INITIAL_STATE, {
        ...CUSTOMERS_LIST_ACTIONS.loadCustomers(),
      });
      state = customersListReducer(state, {
        ...CUSTOMERS_LIST_ACTIONS.loadCustomersSuccess({
          customers: [CUSTOMER],
          info: { length: 1, skip: 0, totalCount: 1 },
        }),
      });
      return { ...state, ...overrides };
    }

    it('prepends on top on the first page and silently bumps totalCount', () => {
      const state = loadedState();
      const next = customersListReducer(state, {
        ...CUSTOMERS_LIST_ACTIONS.customerCreated({ customer: NEW_CUSTOMER }),
      });
      expect(next.customers.map((c) => c.id)).toEqual(['cust_2', 'cust_1']);
      expect(next.info?.totalCount).toBe(2);
      expect(next.info?.length).toBe(2);
      expect(next.request).toBe(state.request);
      expect(next.fetchedQuery).toBe(state.fetchedQuery);
    });

    it('trims to pageSize when the page is full', () => {
      const full = Array.from({ length: 25 }, (_, i) => ({ ...CUSTOMER, id: `cust_full_${i}` }));
      const state = loadedState({
        customers: full,
        info: { length: 25, skip: 0, totalCount: 25 },
      });
      const next = customersListReducer(state, {
        ...CUSTOMERS_LIST_ACTIONS.customerCreated({ customer: NEW_CUSTOMER }),
      });
      expect(next.customers).toHaveLength(25);
      expect(next.customers[0].id).toBe('cust_2');
      expect(next.customers.some((c) => c.id === 'cust_full_24')).toBe(false);
      expect(next.info?.totalCount).toBe(26);
      expect(next.info?.length).toBe(25);
    });

    it('only bumps totalCount when not on the first page', () => {
      const state = loadedState({ pageIndex: 1 });
      const next = customersListReducer(state, {
        ...CUSTOMERS_LIST_ACTIONS.customerCreated({ customer: NEW_CUSTOMER }),
      });
      expect(next.customers).toBe(state.customers);
      expect(next.info?.totalCount).toBe(2);
    });

    it('only bumps totalCount when the name does not match the filter', () => {
      const state = loadedState({ nameFilter: 'acme' });
      const next = customersListReducer(state, {
        ...CUSTOMERS_LIST_ACTIONS.customerCreated({ customer: NEW_CUSTOMER }),
      });
      expect(next.customers).toBe(state.customers);
      expect(next.info?.totalCount).toBe(2);
    });

    it('prepends when the name matches the filter (case-insensitive)', () => {
      const state = loadedState({ nameFilter: 'beta' });
      const next = customersListReducer(state, {
        ...CUSTOMERS_LIST_ACTIONS.customerCreated({ customer: NEW_CUSTOMER }),
      });
      expect(next.customers[0].id).toBe('cust_2');
    });

    it('returns the same state when the page was never loaded', () => {
      const next = customersListReducer(CUSTOMERS_LIST_INITIAL_STATE, {
        ...CUSTOMERS_LIST_ACTIONS.customerCreated({ customer: NEW_CUSTOMER }),
      });
      expect(next).toBe(CUSTOMERS_LIST_INITIAL_STATE);
    });

    it('returns the same state for a duplicate customer id', () => {
      const state = loadedState();
      const next = customersListReducer(state, {
        ...CUSTOMERS_LIST_ACTIONS.customerCreated({ customer: CUSTOMER }),
      });
      expect(next).toBe(state);
    });
  });

  describe('customerUpdated (local sync, no refetch)', () => {
    const UPDATED_CUSTOMER: Customer = { ...CUSTOMER, name: 'Acme Corp Pro' };

    function loadedState(): CustomersListState {
      let state = customersListReducer(CUSTOMERS_LIST_INITIAL_STATE, {
        ...CUSTOMERS_LIST_ACTIONS.loadCustomers(),
      });
      state = customersListReducer(state, {
        ...CUSTOMERS_LIST_ACTIONS.loadCustomersSuccess({
          customers: [CUSTOMER],
          info: { length: 1, skip: 0, totalCount: 1 },
        }),
      });
      return state;
    }

    it('replaces the customer in place when it is on the current page', () => {
      const state = loadedState();
      const next = customersListReducer(state, {
        ...CUSTOMERS_LIST_ACTIONS.customerUpdated({ customer: UPDATED_CUSTOMER }),
      });
      expect(next.customers).toEqual([UPDATED_CUSTOMER]);
      expect(next.info?.totalCount).toBe(1);
      expect(next.request).toBe(state.request);
    });

    it('returns the same state when the customer is not on the current page', () => {
      const state = loadedState();
      const other: Customer = { ...UPDATED_CUSTOMER, id: 'cust_other' };
      const next = customersListReducer(state, {
        ...CUSTOMERS_LIST_ACTIONS.customerUpdated({ customer: other }),
      });
      expect(next).toBe(state);
    });

    it('returns the same state when the page was never loaded', () => {
      const next = customersListReducer(CUSTOMERS_LIST_INITIAL_STATE, {
        ...CUSTOMERS_LIST_ACTIONS.customerUpdated({ customer: UPDATED_CUSTOMER }),
      });
      expect(next).toBe(CUSTOMERS_LIST_INITIAL_STATE);
    });
  });
});
