import { describe, expect, it } from 'vitest';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import { PRODUCT_MUTATIONS_ACTIONS } from '../products-mutations/products-mutations.actions';
import { PRODUCT_DETAILS_ACTIONS } from './product-details.actions';
import {
  PRODUCT_DETAILS_INITIAL_STATE,
  productDetailsReducer,
  ProductDetailsTab,
} from './product-details.reducer';
import type { Product } from '../../models/product.entity';

const MOCK_PRODUCT: Product = {
  id: 'prd_1',
  createdAt: '',
  name: 'Product 1',
  price: 100,
} as Product;

/** Initial state with a loaded product. */
function loadedState(product: Product = MOCK_PRODUCT) {
  return productDetailsReducer(
    productDetailsReducer(PRODUCT_DETAILS_INITIAL_STATE, {
      ...PRODUCT_DETAILS_ACTIONS.loadProduct({ productId: product.id }),
    }),
    { ...PRODUCT_DETAILS_ACTIONS.loadProductSuccess({ product }) },
  );
}

describe('productDetailsReducer', () => {
  describe('loadProduct', () => {
    it('clears the previous entity and starts loading', () => {
      const state = loadedState();
      const next = productDetailsReducer(state, {
        ...PRODUCT_DETAILS_ACTIONS.loadProduct({ productId: 'prd_2' }),
      });
      expect(next.productId).toBe('prd_2');
      expect(next.product).toBeNull();
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });
  });

  describe('refreshProduct', () => {
    it('keeps the entity visible while reloading the same product', () => {
      const state = loadedState();
      const next = productDetailsReducer(state, {
        ...PRODUCT_DETAILS_ACTIONS.refreshProduct({ productId: 'prd_1' }),
      });
      expect(next.product).toBe(state.product);
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });

    it('no-ops for another product id', () => {
      const state = loadedState();
      const next = productDetailsReducer(state, {
        ...PRODUCT_DETAILS_ACTIONS.refreshProduct({ productId: 'prd_2' }),
      });
      expect(next).toBe(state);
    });
  });

  describe('loadProductSuccess/Failure', () => {
    it('stores the product and marks the request loaded', () => {
      let state = productDetailsReducer(PRODUCT_DETAILS_INITIAL_STATE, {
        ...PRODUCT_DETAILS_ACTIONS.loadProduct({ productId: 'prd_1' }),
      });
      state = productDetailsReducer(state, {
        ...PRODUCT_DETAILS_ACTIONS.loadProductSuccess({ product: MOCK_PRODUCT }),
      });
      expect(state.product).toBe(MOCK_PRODUCT);
      expect(state.request.status).toBe(LOAD_STATUS.Loaded);
      expect(state.request.error).toBeNull();
    });

    it('clears the entity and applies the failure', () => {
      let state = loadedState();
      state = productDetailsReducer(state, {
        ...PRODUCT_DETAILS_ACTIONS.loadProductFailure({ error: new Error('boom') }),
      });
      expect(state.product).toBeNull();
      expect(state.request.status).toBe(LOAD_STATUS.Error);
      expect(state.request.error).not.toBeNull();
      expect(state.request.failureNonce).toBe(1);
    });
  });

  describe('setActiveTab', () => {
    it('no-ops the same tab', () => {
      const state = productDetailsReducer(loadedState(), {
        ...PRODUCT_DETAILS_ACTIONS.setActiveTab({ activeTab: ProductDetailsTab.Batches }),
      });
      const next = productDetailsReducer(state, {
        ...PRODUCT_DETAILS_ACTIONS.setActiveTab({ activeTab: ProductDetailsTab.Batches }),
      });
      expect(next).toBe(state);
    });

    it('switches the tab', () => {
      const next = productDetailsReducer(loadedState(), {
        ...PRODUCT_DETAILS_ACTIONS.setActiveTab({ activeTab: ProductDetailsTab.Orders }),
      });
      expect(next.activeTab).toBe(ProductDetailsTab.Orders);
    });
  });

  describe('silent sync from the products-mutations slice', () => {
    it('folds an updated entity in without refetching when the store holds that product', () => {
      const state = loadedState();
      const updatedProduct = { ...MOCK_PRODUCT, name: 'Product 1 (edited)' } as Product;
      const next = productDetailsReducer(state, {
        ...PRODUCT_MUTATIONS_ACTIONS.updateProductSuccess({ product: updatedProduct }),
      });
      expect(next.product).toEqual(updatedProduct);
      expect(next.request.status).toBe(LOAD_STATUS.Loaded);
    });

    it('ignores updates for products the store is not holding', () => {
      const state = loadedState();
      const other = { ...MOCK_PRODUCT, id: 'prd_2', name: 'Other' } as Product;
      const next = productDetailsReducer(state, {
        ...PRODUCT_MUTATIONS_ACTIONS.updateProductSuccess({ product: other }),
      });
      expect(next).toBe(state);
    });
  });
});
