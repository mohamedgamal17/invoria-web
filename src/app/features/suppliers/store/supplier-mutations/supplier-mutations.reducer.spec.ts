import { describe, expect, it } from 'vitest';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { Supplier } from '../../models/supplier.entity';
import { SUPPLIER_MUTATIONS_ACTIONS } from './supplier-mutations.actions';
import {
  SUPPLIER_MUTATIONS_INITIAL_STATE,
  supplierMutationsReducer,
} from './supplier-mutations.reducer';

const REQUEST = { Name: 'Alpha Supplier' };
const SUPPLIER: Supplier = {
  id: 'sup_1',
  name: 'Alpha Supplier',
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('supplierMutationsReducer', () => {
  describe('create flow', () => {
    it('starts the create request and leaves the update fragment untouched', () => {
      const next = supplierMutationsReducer(SUPPLIER_MUTATIONS_INITIAL_STATE, {
        ...SUPPLIER_MUTATIONS_ACTIONS.createSupplier({ request: REQUEST }),
      });
      expect(next.createRequest.status).toBe(LOAD_STATUS.Loading);
      expect(next.createRequest.error).toBeNull();
      expect(next.updateRequest).toBe(SUPPLIER_MUTATIONS_INITIAL_STATE.updateRequest);
    });

    it('ignores a repeated create while one is in flight (same state reference)', () => {
      let state = supplierMutationsReducer(SUPPLIER_MUTATIONS_INITIAL_STATE, {
        ...SUPPLIER_MUTATIONS_ACTIONS.createSupplier({ request: REQUEST }),
      });
      const next = supplierMutationsReducer(state, {
        ...SUPPLIER_MUTATIONS_ACTIONS.createSupplier({ request: REQUEST }),
      });
      expect(next).toBe(state);
      expect(next.createRequest.status).toBe(LOAD_STATUS.Loading);
    });

    it('marks the create request loaded on success', () => {
      let state = supplierMutationsReducer(SUPPLIER_MUTATIONS_INITIAL_STATE, {
        ...SUPPLIER_MUTATIONS_ACTIONS.createSupplier({ request: REQUEST }),
      });
      const next = supplierMutationsReducer(state, {
        ...SUPPLIER_MUTATIONS_ACTIONS.createSupplierSuccess({ supplier: SUPPLIER }),
      });
      expect(next.createRequest.status).toBe(LOAD_STATUS.Loaded);
      expect(next.createRequest.error).toBeNull();
    });

    it('applies the failure to the create request', () => {
      let state = supplierMutationsReducer(SUPPLIER_MUTATIONS_INITIAL_STATE, {
        ...SUPPLIER_MUTATIONS_ACTIONS.createSupplier({ request: REQUEST }),
      });
      const next = supplierMutationsReducer(state, {
        ...SUPPLIER_MUTATIONS_ACTIONS.createSupplierFailure({ error: new Error('boom') }),
      });
      expect(next.createRequest.status).toBe(LOAD_STATUS.Error);
      expect(next.createRequest.error).toBeTruthy();
      expect(next.createRequest.failureNonce).toBe(1);
      expect(next.updateRequest).toBe(SUPPLIER_MUTATIONS_INITIAL_STATE.updateRequest);
    });

    it('allows a new create after a failure and resets the inline error', () => {
      let state = supplierMutationsReducer(SUPPLIER_MUTATIONS_INITIAL_STATE, {
        ...SUPPLIER_MUTATIONS_ACTIONS.createSupplier({ request: REQUEST }),
      });
      state = supplierMutationsReducer(state, {
        ...SUPPLIER_MUTATIONS_ACTIONS.createSupplierFailure({ error: new Error('boom') }),
      });
      const next = supplierMutationsReducer(state, {
        ...SUPPLIER_MUTATIONS_ACTIONS.createSupplier({ request: REQUEST }),
      });
      expect(next.createRequest.status).toBe(LOAD_STATUS.Loading);
      expect(next.createRequest.error).toBeNull();
      expect(next.createRequest.failureNonce).toBe(1);
    });
  });

  describe('update flow', () => {
    it('starts the update request and leaves the create fragment untouched', () => {
      const next = supplierMutationsReducer(SUPPLIER_MUTATIONS_INITIAL_STATE, {
        ...SUPPLIER_MUTATIONS_ACTIONS.updateSupplier({ id: 'sup_1', request: REQUEST }),
      });
      expect(next.updateRequest.status).toBe(LOAD_STATUS.Loading);
      expect(next.createRequest).toBe(SUPPLIER_MUTATIONS_INITIAL_STATE.createRequest);
    });

    it('ignores a repeated update while one is in flight (same state reference)', () => {
      let state = supplierMutationsReducer(SUPPLIER_MUTATIONS_INITIAL_STATE, {
        ...SUPPLIER_MUTATIONS_ACTIONS.updateSupplier({ id: 'sup_1', request: REQUEST }),
      });
      const next = supplierMutationsReducer(state, {
        ...SUPPLIER_MUTATIONS_ACTIONS.updateSupplier({ id: 'sup_1', request: REQUEST }),
      });
      expect(next).toBe(state);
      expect(next.updateRequest.status).toBe(LOAD_STATUS.Loading);
    });

    it('marks the update request loaded on success', () => {
      let state = supplierMutationsReducer(SUPPLIER_MUTATIONS_INITIAL_STATE, {
        ...SUPPLIER_MUTATIONS_ACTIONS.updateSupplier({ id: 'sup_1', request: REQUEST }),
      });
      const next = supplierMutationsReducer(state, {
        ...SUPPLIER_MUTATIONS_ACTIONS.updateSupplierSuccess({ supplier: SUPPLIER }),
      });
      expect(next.updateRequest.status).toBe(LOAD_STATUS.Loaded);
    });

    it('applies the failure to the update request', () => {
      let state = supplierMutationsReducer(SUPPLIER_MUTATIONS_INITIAL_STATE, {
        ...SUPPLIER_MUTATIONS_ACTIONS.updateSupplier({ id: 'sup_1', request: REQUEST }),
      });
      const next = supplierMutationsReducer(state, {
        ...SUPPLIER_MUTATIONS_ACTIONS.updateSupplierFailure({ error: new Error('boom') }),
      });
      expect(next.updateRequest.status).toBe(LOAD_STATUS.Error);
      expect(next.updateRequest.failureNonce).toBe(1);
      expect(next.createRequest).toBe(SUPPLIER_MUTATIONS_INITIAL_STATE.createRequest);
    });
  });
});
