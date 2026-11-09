import { describe, expect, it } from 'vitest';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { Invoice } from '../../models/invoice.entity';
import { INVOICES_LIST_ACTIONS } from './invoices-list.actions';
import {
  INVOICES_LIST_INITIAL_STATE,
  invoicesListReducer,
  type InvoicesListState,
} from './invoices-list.reducer';

const EMPTY_PAGE_INFO = { length: 0, skip: 0, totalCount: 0 };

const INVOICE: Invoice = {
  id: 'inv_1',
  createdAt: '2026-01-01T00:00:00.000Z',
  invoiceNumber: 'INV-42',
  customerId: 'cus_1',
  orderId: 'ord_1',
  subtotal: 80,
  totalPrice: 100,
  items: [],
};

describe('invoicesListReducer', () => {
  describe('setQueryFromUrl', () => {
    it('returns the same state object when the query already matches (filters normalized)', () => {
      const primed: InvoicesListState = {
        ...INVOICES_LIST_INITIAL_STATE,
        customerIdFilter: 'cus_1',
        orderIdFilter: 'ord_1',
      };
      const next = invoicesListReducer(primed, {
        ...INVOICES_LIST_ACTIONS.setQueryFromUrl({
          pageIndex: 0,
          pageSize: 25,
          customerIdFilter: ' cus_1 ',
          orderIdFilter: ' ord_1 ',
        }),
      });
      expect(next).toBe(primed);
      expect(next.customerIdFilter).toBe('cus_1');
      expect(next.orderIdFilter).toBe('ord_1');
    });

    it('replaces the query values on a real change', () => {
      const next = invoicesListReducer(INVOICES_LIST_INITIAL_STATE, {
        ...INVOICES_LIST_ACTIONS.setQueryFromUrl({
          pageIndex: 3,
          pageSize: 50,
          customerIdFilter: 'cus_1',
          orderIdFilter: '',
        }),
      });
      expect(next.pageIndex).toBe(3);
      expect(next.pageSize).toBe(50);
      expect(next.customerIdFilter).toBe('cus_1');
      expect(next.orderIdFilter).toBe('');
    });
  });

  describe('loadInvoices (the state decides whether the API is called)', () => {
    it('starts loading on the first trigger', () => {
      const next = invoicesListReducer(INVOICES_LIST_INITIAL_STATE, {
        ...INVOICES_LIST_ACTIONS.loadInvoices(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
      expect(next.fetchedQuery?.pageIndex).toBe(0);
      expect(next.fetchedQuery?.pageSize).toBe(25);
      expect(next.fetchedQuery?.customerIdFilter).toBe('');
      expect(next.fetchedQuery?.orderIdFilter).toBe('');
    });

    it('does not start a second request for the same query once loaded', () => {
      let state = invoicesListReducer(INVOICES_LIST_INITIAL_STATE, {
        ...INVOICES_LIST_ACTIONS.loadInvoices(),
      });
      state = invoicesListReducer(state, {
        ...INVOICES_LIST_ACTIONS.loadInvoicesSuccess({ invoices: [], info: EMPTY_PAGE_INFO }),
      });
      const next = invoicesListReducer(state, {
        ...INVOICES_LIST_ACTIONS.loadInvoices(),
      });
      expect(next).toBe(state);
      expect(next.request.status).toBe(LOAD_STATUS.Loaded);
    });

    it('does not restart an in-flight request for the same query', () => {
      let state = invoicesListReducer(INVOICES_LIST_INITIAL_STATE, {
        ...INVOICES_LIST_ACTIONS.loadInvoices(),
      });
      const next = invoicesListReducer(state, {
        ...INVOICES_LIST_ACTIONS.loadInvoices(),
      });
      expect(next).toBe(state);
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });

    it('starts a new request when the query actually changed', () => {
      let state = invoicesListReducer(INVOICES_LIST_INITIAL_STATE, {
        ...INVOICES_LIST_ACTIONS.setQueryFromUrl({
          pageIndex: 0,
          pageSize: 25,
          customerIdFilter: 'cus_1',
          orderIdFilter: '',
        }),
      });
      state = invoicesListReducer(state, { ...INVOICES_LIST_ACTIONS.loadInvoices() });
      state = invoicesListReducer(state, {
        ...INVOICES_LIST_ACTIONS.loadInvoicesSuccess({ invoices: [], info: EMPTY_PAGE_INFO }),
      });
      state = invoicesListReducer(state, {
        ...INVOICES_LIST_ACTIONS.setQueryFromUrl({
          pageIndex: 1,
          pageSize: 25,
          customerIdFilter: 'cus_1',
          orderIdFilter: '',
        }),
      });
      const next = invoicesListReducer(state, {
        ...INVOICES_LIST_ACTIONS.loadInvoices(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
      expect(next.fetchedQuery?.pageIndex).toBe(1);
    });

    it('starts a new request when only a filter changed', () => {
      let state = invoicesListReducer(INVOICES_LIST_INITIAL_STATE, {
        ...INVOICES_LIST_ACTIONS.loadInvoices(),
      });
      state = invoicesListReducer(state, {
        ...INVOICES_LIST_ACTIONS.loadInvoicesSuccess({ invoices: [INVOICE], info: EMPTY_PAGE_INFO }),
      });
      state = invoicesListReducer(state, {
        ...INVOICES_LIST_ACTIONS.setQueryFromUrl({
          pageIndex: 0,
          pageSize: 25,
          customerIdFilter: '',
          orderIdFilter: 'ord_7',
        }),
      });
      const next = invoicesListReducer(state, {
        ...INVOICES_LIST_ACTIONS.loadInvoices(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
      expect(next.fetchedQuery?.orderIdFilter).toBe('ord_7');
    });

    it('is re-triggerable for the same query after a failure', () => {
      let state = invoicesListReducer(INVOICES_LIST_INITIAL_STATE, {
        ...INVOICES_LIST_ACTIONS.loadInvoices(),
      });
      state = invoicesListReducer(state, {
        ...INVOICES_LIST_ACTIONS.loadInvoicesFailure({ error: new Error('boom') }),
      });
      expect(state.fetchedQuery).toBeNull();
      expect(state.request.status).toBe(LOAD_STATUS.Error);
      const next = invoicesListReducer(state, {
        ...INVOICES_LIST_ACTIONS.loadInvoices(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });
  });

  describe('loadInvoicesSuccess', () => {
    it('stores invoices and paging info and clears the error', () => {
      let state = invoicesListReducer(INVOICES_LIST_INITIAL_STATE, {
        ...INVOICES_LIST_ACTIONS.loadInvoicesFailure({ error: new Error('boom') }),
      });
      const next = invoicesListReducer(state, {
        ...INVOICES_LIST_ACTIONS.loadInvoicesSuccess({
          invoices: [INVOICE],
          info: { length: 25, skip: 0, totalCount: 1 },
        }),
      });
      expect(next.invoices).toHaveLength(1);
      expect(next.info?.totalCount).toBe(1);
      expect(next.request.status).toBe(LOAD_STATUS.Loaded);
      expect(next.request.error).toBeNull();
    });
  });

  describe('loadInvoicesFailure', () => {
    it('clears the list, paging info and fetched query', () => {
      let state = invoicesListReducer(INVOICES_LIST_INITIAL_STATE, {
        ...INVOICES_LIST_ACTIONS.loadInvoices(),
      });
      state = invoicesListReducer(state, {
        ...INVOICES_LIST_ACTIONS.loadInvoicesSuccess({
          invoices: [INVOICE],
          info: { length: 25, skip: 0, totalCount: 1 },
        }),
      });
      const next = invoicesListReducer(state, {
        ...INVOICES_LIST_ACTIONS.loadInvoicesFailure({ error: new Error('boom') }),
      });
      expect(next.invoices).toEqual([]);
      expect(next.info).toBeNull();
      expect(next.fetchedQuery).toBeNull();
      expect(next.request.status).toBe(LOAD_STATUS.Error);
      expect(next.request.failureNonce).toBe(1);
      expect(next.request.error).toBeTruthy();
    });
  });
});
