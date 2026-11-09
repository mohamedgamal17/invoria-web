import { describe, expect, it } from 'vitest';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { InvoiceItem } from '../../models/invoice.entity';
import type { Invoice } from '../../models/invoice.entity';
import { INVOICE_DETAILS_ACTIONS } from './invoice-details.actions';
import {
  INVOICE_DETAILS_INITIAL_STATE,
  invoiceDetailsReducer,
  type InvoiceDetailsState,
} from './invoice-details.reducer';

const ITEM: InvoiceItem = {
  orderItemId: 'oli_1',
  productId: 'prd_1',
  quantity: 2,
  price: 50,
  lineTotal: 100,
};

const INVOICE: Invoice = {
  id: 'inv_1',
  createdAt: '2026-01-01T00:00:00.000Z',
  invoiceNumber: 'INV-42',
  customerId: 'cus_1',
  orderId: 'ord_1',
  subtotal: 80,
  totalPrice: 100,
  items: [ITEM],
};

const LOADED: InvoiceDetailsState = {
  ...INVOICE_DETAILS_INITIAL_STATE,
  invoiceId: 'inv_1',
  invoice: INVOICE,
  request: { ...INVOICE_DETAILS_INITIAL_STATE.request, status: LOAD_STATUS.Loaded },
};

describe('invoiceDetailsReducer', () => {
  describe('setActiveTab', () => {
    it('returns the same state object for an identical tab', () => {
      const primed = { ...LOADED, activeTab: 1 };
      expect(
        invoiceDetailsReducer(primed, { ...INVOICE_DETAILS_ACTIONS.setActiveTab({ activeTab: 1 }) }),
      ).toBe(primed);
    });

    it('applies a real tab change', () => {
      const next = invoiceDetailsReducer(
        LOADED,
        { ...INVOICE_DETAILS_ACTIONS.setActiveTab({ activeTab: 1 }) },
      );
      expect(next.activeTab).toBe(1);
      expect(next.invoice).toBe(INVOICE);
    });
  });

  describe('loadInvoice', () => {
    it('resets the entity and starts loading', () => {
      const next = invoiceDetailsReducer(
        LOADED,
        { ...INVOICE_DETAILS_ACTIONS.loadInvoice({ invoiceId: 'inv_2' }) },
      );
      expect(next.invoiceId).toBe('inv_2');
      expect(next.invoice).toBeNull();
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });

    it('resets the tab only when switching invoices', () => {
      const primed = { ...LOADED, activeTab: 1 };
      const same = invoiceDetailsReducer(
        primed,
        { ...INVOICE_DETAILS_ACTIONS.loadInvoice({ invoiceId: 'inv_1' }) },
      );
      expect(same.activeTab).toBe(1);
      const other = invoiceDetailsReducer(
        primed,
        { ...INVOICE_DETAILS_ACTIONS.loadInvoice({ invoiceId: 'inv_2' }) },
      );
      expect(other.activeTab).toBe(0);
    });
  });

  describe('refreshInvoice', () => {
    it('keeps the entity visible for the same invoice', () => {
      const next = invoiceDetailsReducer(
        LOADED,
        { ...INVOICE_DETAILS_ACTIONS.refreshInvoice({ invoiceId: 'inv_1' }) },
      );
      expect(next.invoice).toBe(INVOICE);
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });

    it('ignores a foreign id', () => {
      const next = invoiceDetailsReducer(
        LOADED,
        { ...INVOICE_DETAILS_ACTIONS.refreshInvoice({ invoiceId: 'inv_2' }) },
      );
      expect(next).toBe(LOADED);
    });
  });

  describe('load success / failure', () => {
    it('settles the request and folds the entity in', () => {
      const next = invoiceDetailsReducer(
        { ...INVOICE_DETAILS_INITIAL_STATE, invoiceId: 'inv_1' },
        { ...INVOICE_DETAILS_ACTIONS.loadInvoiceSuccess({ invoice: INVOICE }) },
      );
      expect(next.invoice).toBe(INVOICE);
      expect(next.request.status).toBe(LOAD_STATUS.Loaded);
      expect(next.request.error).toBeNull();
    });

    it('applies failure detail and bumps the nonce', () => {
      const next = invoiceDetailsReducer(
        { ...INVOICE_DETAILS_INITIAL_STATE, invoiceId: 'inv_1' },
        { ...INVOICE_DETAILS_ACTIONS.loadInvoiceFailure({ error: new Error('boom') }) },
      );
      expect(next.invoice).toBeNull();
      expect(next.request.status).toBe(LOAD_STATUS.Error);
      expect(next.request.failureNonce).toBe(1);
      expect(next.request.error).toBeTruthy();
    });
  });
});
