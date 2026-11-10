import { describe, expect, it } from 'vitest';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import { SUPPLIER_MUTATIONS_ACTIONS } from '../supplier-mutations/supplier-mutations.actions';
import { SUPPLIER_DETAILS_ACTIONS } from './supplier-details.actions';
import {
  SUPPLIER_DETAILS_INITIAL_STATE,
  supplierDetailsReducer,
  SupplierDetailsTab,
} from './supplier-details.reducer';
import type { Supplier } from '../../models/supplier.entity';

const MOCK_SUPPLIER: Supplier = {
  id: 'sup_1',
  name: 'Acme Supplies',
  createdAt: '2026-01-01T00:00:00.000Z',
};

/** Initial state with a loaded supplier. */
function loadedState(supplier: Supplier = MOCK_SUPPLIER) {
  return supplierDetailsReducer(
    supplierDetailsReducer(SUPPLIER_DETAILS_INITIAL_STATE, {
      ...SUPPLIER_DETAILS_ACTIONS.loadSupplier({ supplierId: supplier.id }),
    }),
    { ...SUPPLIER_DETAILS_ACTIONS.loadSupplierSuccess({ supplier }) },
  );
}

describe('supplierDetailsReducer', () => {
  describe('loadSupplier', () => {
    it('clears the previous entity and starts loading', () => {
      const state = loadedState();
      const next = supplierDetailsReducer(state, {
        ...SUPPLIER_DETAILS_ACTIONS.loadSupplier({ supplierId: 'sup_2' }),
      });
      expect(next.supplierId).toBe('sup_2');
      expect(next.supplier).toBeNull();
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });
  });

  describe('loadSupplierSuccess/Failure', () => {
    it('stores the supplier and marks the request loaded', () => {
      let state = supplierDetailsReducer(SUPPLIER_DETAILS_INITIAL_STATE, {
        ...SUPPLIER_DETAILS_ACTIONS.loadSupplier({ supplierId: 'sup_1' }),
      });
      state = supplierDetailsReducer(state, {
        ...SUPPLIER_DETAILS_ACTIONS.loadSupplierSuccess({ supplier: MOCK_SUPPLIER }),
      });
      expect(state.supplier).toBe(MOCK_SUPPLIER);
      expect(state.request.status).toBe(LOAD_STATUS.Loaded);
      expect(state.request.error).toBeNull();
    });

    it('clears the entity and applies the failure', () => {
      let state = loadedState();
      state = supplierDetailsReducer(state, {
        ...SUPPLIER_DETAILS_ACTIONS.loadSupplierFailure({ error: new Error('boom') }),
      });
      expect(state.supplier).toBeNull();
      expect(state.request.status).toBe(LOAD_STATUS.Error);
      expect(state.request.error).not.toBeNull();
      expect(state.request.failureNonce).toBe(1);
    });
  });

  describe('setActiveTab', () => {
    it('no-ops the same tab', () => {
      const state = supplierDetailsReducer(loadedState(), {
        ...SUPPLIER_DETAILS_ACTIONS.setActiveTab({ activeTab: SupplierDetailsTab.PurchaseOrders }),
      });
      const next = supplierDetailsReducer(state, {
        ...SUPPLIER_DETAILS_ACTIONS.setActiveTab({ activeTab: SupplierDetailsTab.PurchaseOrders }),
      });
      expect(next).toBe(state);
    });

    it('switches the tab', () => {
      const next = supplierDetailsReducer(loadedState(), {
        ...SUPPLIER_DETAILS_ACTIONS.setActiveTab({ activeTab: SupplierDetailsTab.PurchaseOrders }),
      });
      expect(next.activeTab).toBe(SupplierDetailsTab.PurchaseOrders);
    });
  });

  describe('silent sync from the suppliers-mutations slice', () => {
    it('folds an updated entity in without refetching when the store holds that supplier', () => {
      const state = loadedState();
      const updatedSupplier = { ...MOCK_SUPPLIER, name: 'Acme Supplies (edited)' };
      const next = supplierDetailsReducer(state, {
        ...SUPPLIER_MUTATIONS_ACTIONS.updateSupplierSuccess({ supplier: updatedSupplier }),
      });
      expect(next.supplier).toEqual(updatedSupplier);
      expect(next.request.status).toBe(LOAD_STATUS.Loaded);
    });

    it('ignores updates for suppliers the store is not holding', () => {
      const state = loadedState();
      const other = { ...MOCK_SUPPLIER, id: 'sup_2', name: 'Other' };
      const next = supplierDetailsReducer(state, {
        ...SUPPLIER_MUTATIONS_ACTIONS.updateSupplierSuccess({ supplier: other }),
      });
      expect(next).toBe(state);
    });
  });
});
