import { describe, expect, it } from 'vitest';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { Product } from '../../models/product.entity';
import { PRODUCT_MUTATIONS_ACTIONS } from './products-mutations.actions';
import {
  PRODUCTS_MUTATIONS_INITIAL_STATE,
  productsMutationsReducer,
} from './products-mutations.reducer';

const CREATE_REQUEST = { Name: 'Alpha Widget', Price: 100 };
const UPDATE_REQUEST = { Name: 'Alpha Widget Pro', Price: 150 };
const PRODUCT: Product = {
  id: 'prd_1',
  name: 'Alpha Widget',
  price: 100,
  stock: { actualQuantity: 10, reservedQuantity: 2 },
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('productsMutationsReducer', () => {
  describe('create flow', () => {
    it('starts the create request and leaves the update fragment untouched', () => {
      const next = productsMutationsReducer(PRODUCTS_MUTATIONS_INITIAL_STATE, {
        ...PRODUCT_MUTATIONS_ACTIONS.createProduct({ request: CREATE_REQUEST }),
      });
      expect(next.createRequest.status).toBe(LOAD_STATUS.Loading);
      expect(next.createRequest.error).toBeNull();
      expect(next.updateRequest).toBe(PRODUCTS_MUTATIONS_INITIAL_STATE.updateRequest);
    });

    it('ignores a repeated create while one is in flight (same state reference)', () => {
      let state = productsMutationsReducer(PRODUCTS_MUTATIONS_INITIAL_STATE, {
        ...PRODUCT_MUTATIONS_ACTIONS.createProduct({ request: CREATE_REQUEST }),
      });
      const next = productsMutationsReducer(state, {
        ...PRODUCT_MUTATIONS_ACTIONS.createProduct({ request: CREATE_REQUEST }),
      });
      expect(next).toBe(state);
      expect(next.createRequest.status).toBe(LOAD_STATUS.Loading);
    });

    it('marks the create request loaded on success', () => {
      let state = productsMutationsReducer(PRODUCTS_MUTATIONS_INITIAL_STATE, {
        ...PRODUCT_MUTATIONS_ACTIONS.createProduct({ request: CREATE_REQUEST }),
      });
      const next = productsMutationsReducer(state, {
        ...PRODUCT_MUTATIONS_ACTIONS.createProductSuccess({ product: PRODUCT }),
      });
      expect(next.createRequest.status).toBe(LOAD_STATUS.Loaded);
      expect(next.createRequest.error).toBeNull();
    });

    it('applies the failure to the create request', () => {
      let state = productsMutationsReducer(PRODUCTS_MUTATIONS_INITIAL_STATE, {
        ...PRODUCT_MUTATIONS_ACTIONS.createProduct({ request: CREATE_REQUEST }),
      });
      const next = productsMutationsReducer(state, {
        ...PRODUCT_MUTATIONS_ACTIONS.createProductFailure({ error: new Error('boom') }),
      });
      expect(next.createRequest.status).toBe(LOAD_STATUS.Error);
      expect(next.createRequest.error).toBeTruthy();
      expect(next.createRequest.failureNonce).toBe(1);
      expect(next.updateRequest).toBe(PRODUCTS_MUTATIONS_INITIAL_STATE.updateRequest);
    });

    it('allows a new create after a failure and resets the inline error', () => {
      let state = productsMutationsReducer(PRODUCTS_MUTATIONS_INITIAL_STATE, {
        ...PRODUCT_MUTATIONS_ACTIONS.createProduct({ request: CREATE_REQUEST }),
      });
      state = productsMutationsReducer(state, {
        ...PRODUCT_MUTATIONS_ACTIONS.createProductFailure({ error: new Error('boom') }),
      });
      const next = productsMutationsReducer(state, {
        ...PRODUCT_MUTATIONS_ACTIONS.createProduct({ request: CREATE_REQUEST }),
      });
      expect(next.createRequest.status).toBe(LOAD_STATUS.Loading);
      expect(next.createRequest.error).toBeNull();
      expect(next.createRequest.failureNonce).toBe(1);
    });
  });

  describe('update flow', () => {
    it('starts the update request and leaves the create fragment untouched', () => {
      const next = productsMutationsReducer(PRODUCTS_MUTATIONS_INITIAL_STATE, {
        ...PRODUCT_MUTATIONS_ACTIONS.updateProduct({ id: 'prd_1', request: UPDATE_REQUEST }),
      });
      expect(next.updateRequest.status).toBe(LOAD_STATUS.Loading);
      expect(next.createRequest).toBe(PRODUCTS_MUTATIONS_INITIAL_STATE.createRequest);
    });

    it('ignores a repeated update while one is in flight (same state reference)', () => {
      let state = productsMutationsReducer(PRODUCTS_MUTATIONS_INITIAL_STATE, {
        ...PRODUCT_MUTATIONS_ACTIONS.updateProduct({ id: 'prd_1', request: UPDATE_REQUEST }),
      });
      const next = productsMutationsReducer(state, {
        ...PRODUCT_MUTATIONS_ACTIONS.updateProduct({ id: 'prd_1', request: UPDATE_REQUEST }),
      });
      expect(next).toBe(state);
      expect(next.updateRequest.status).toBe(LOAD_STATUS.Loading);
    });

    it('marks the update request loaded on success', () => {
      let state = productsMutationsReducer(PRODUCTS_MUTATIONS_INITIAL_STATE, {
        ...PRODUCT_MUTATIONS_ACTIONS.updateProduct({ id: 'prd_1', request: UPDATE_REQUEST }),
      });
      const next = productsMutationsReducer(state, {
        ...PRODUCT_MUTATIONS_ACTIONS.updateProductSuccess({ product: PRODUCT }),
      });
      expect(next.updateRequest.status).toBe(LOAD_STATUS.Loaded);
    });

    it('applies the failure to the update request', () => {
      let state = productsMutationsReducer(PRODUCTS_MUTATIONS_INITIAL_STATE, {
        ...PRODUCT_MUTATIONS_ACTIONS.updateProduct({ id: 'prd_1', request: UPDATE_REQUEST }),
      });
      const next = productsMutationsReducer(state, {
        ...PRODUCT_MUTATIONS_ACTIONS.updateProductFailure({ error: new Error('boom') }),
      });
      expect(next.updateRequest.status).toBe(LOAD_STATUS.Error);
      expect(next.updateRequest.failureNonce).toBe(1);
      expect(next.createRequest).toBe(PRODUCTS_MUTATIONS_INITIAL_STATE.createRequest);
    });
  });

  describe('delete flow', () => {
    it('starts the delete request and leaves the other fragments untouched', () => {
      const next = productsMutationsReducer(PRODUCTS_MUTATIONS_INITIAL_STATE, {
        ...PRODUCT_MUTATIONS_ACTIONS.deleteProduct({ id: 'prd_1' }),
      });
      expect(next.deleteRequest.status).toBe(LOAD_STATUS.Loading);
      expect(next.createRequest).toBe(PRODUCTS_MUTATIONS_INITIAL_STATE.createRequest);
      expect(next.updateRequest).toBe(PRODUCTS_MUTATIONS_INITIAL_STATE.updateRequest);
    });

    it('ignores a repeated delete while one is in flight (same state reference)', () => {
      let state = productsMutationsReducer(PRODUCTS_MUTATIONS_INITIAL_STATE, {
        ...PRODUCT_MUTATIONS_ACTIONS.deleteProduct({ id: 'prd_1' }),
      });
      const next = productsMutationsReducer(state, {
        ...PRODUCT_MUTATIONS_ACTIONS.deleteProduct({ id: 'prd_2' }),
      });
      expect(next).toBe(state);
      expect(next.deleteRequest.status).toBe(LOAD_STATUS.Loading);
    });

    it('marks the delete request loaded on success', () => {
      let state = productsMutationsReducer(PRODUCTS_MUTATIONS_INITIAL_STATE, {
        ...PRODUCT_MUTATIONS_ACTIONS.deleteProduct({ id: 'prd_1' }),
      });
      const next = productsMutationsReducer(state, {
        ...PRODUCT_MUTATIONS_ACTIONS.deleteProductSuccess({ id: 'prd_1' }),
      });
      expect(next.deleteRequest.status).toBe(LOAD_STATUS.Loaded);
      expect(next.deleteRequest.error).toBeNull();
    });

    it('applies the failure to the delete request and allows a retry', () => {
      let state = productsMutationsReducer(PRODUCTS_MUTATIONS_INITIAL_STATE, {
        ...PRODUCT_MUTATIONS_ACTIONS.deleteProduct({ id: 'prd_1' }),
      });
      state = productsMutationsReducer(state, {
        ...PRODUCT_MUTATIONS_ACTIONS.deleteProductFailure({ error: new Error('boom') }),
      });
      expect(state.deleteRequest.status).toBe(LOAD_STATUS.Error);
      expect(state.deleteRequest.failureNonce).toBe(1);

      const next = productsMutationsReducer(state, {
        ...PRODUCT_MUTATIONS_ACTIONS.deleteProduct({ id: 'prd_1' }),
      });
      expect(next.deleteRequest.status).toBe(LOAD_STATUS.Loading);
      expect(next.deleteRequest.error).toBeNull();
    });
  });
});
