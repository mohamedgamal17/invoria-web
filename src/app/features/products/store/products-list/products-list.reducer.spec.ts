import { describe, expect, it } from 'vitest';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { Product } from '../../models/product.entity';
import { PRODUCTS_LIST_ACTIONS } from './products-list.actions';
import {
  PRODUCTS_LIST_INITIAL_STATE,
  productsListReducer,
  type ProductsListState,
} from './products-list.reducer';

const EMPTY_PAGE_INFO = { length: 0, skip: 0, totalCount: 0 };

const PRODUCT: Product = {
  id: 'prd_1',
  name: 'Alpha Widget',
  price: 100,
  stock: { actualQuantity: 10, reservedQuantity: 2 },
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('productsListReducer', () => {
  describe('setQueryFromUrl', () => {
    it('returns the same state object when the query already matches (name normalized)', () => {
      const primed: ProductsListState = { ...PRODUCTS_LIST_INITIAL_STATE, nameFilter: 'widget' };
      const next = productsListReducer(primed, {
        ...PRODUCTS_LIST_ACTIONS.setQueryFromUrl({
          pageIndex: 0,
          pageSize: 25,
          nameFilter: ' widget ',
        }),
      });
      expect(next).toBe(primed);
      expect(next.nameFilter).toBe('widget');
    });

    it('replaces the query values on a real change', () => {
      const next = productsListReducer(PRODUCTS_LIST_INITIAL_STATE, {
        ...PRODUCTS_LIST_ACTIONS.setQueryFromUrl({
          pageIndex: 3,
          pageSize: 50,
          nameFilter: 'widget',
        }),
      });
      expect(next.pageIndex).toBe(3);
      expect(next.pageSize).toBe(50);
      expect(next.nameFilter).toBe('widget');
    });
  });

  describe('loadProducts (the state decides whether the API is called)', () => {
    it('starts loading on the first trigger', () => {
      const next = productsListReducer(PRODUCTS_LIST_INITIAL_STATE, {
        ...PRODUCTS_LIST_ACTIONS.loadProducts(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
      expect(next.fetchedQuery?.pageIndex).toBe(0);
      expect(next.fetchedQuery?.pageSize).toBe(25);
      expect(next.fetchedQuery?.nameFilter).toBe('');
    });

    it('does not start a second request for the same query once loaded', () => {
      let state = productsListReducer(PRODUCTS_LIST_INITIAL_STATE, {
        ...PRODUCTS_LIST_ACTIONS.loadProducts(),
      });
      state = productsListReducer(state, {
        ...PRODUCTS_LIST_ACTIONS.loadProductsSuccess({ products: [], info: EMPTY_PAGE_INFO }),
      });
      const next = productsListReducer(state, {
        ...PRODUCTS_LIST_ACTIONS.loadProducts(),
      });
      expect(next).toBe(state);
      expect(next.request.status).toBe(LOAD_STATUS.Loaded);
    });

    it('does not restart an in-flight request for the same query', () => {
      let state = productsListReducer(PRODUCTS_LIST_INITIAL_STATE, {
        ...PRODUCTS_LIST_ACTIONS.loadProducts(),
      });
      const next = productsListReducer(state, {
        ...PRODUCTS_LIST_ACTIONS.loadProducts(),
      });
      expect(next).toBe(state);
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });

    it('starts a new request when the query actually changed', () => {
      let state = productsListReducer(PRODUCTS_LIST_INITIAL_STATE, {
        ...PRODUCTS_LIST_ACTIONS.setQueryFromUrl({
          pageIndex: 0,
          pageSize: 25,
          nameFilter: 'widget',
        }),
      });
      state = productsListReducer(state, { ...PRODUCTS_LIST_ACTIONS.loadProducts() });
      state = productsListReducer(state, {
        ...PRODUCTS_LIST_ACTIONS.loadProductsSuccess({ products: [], info: EMPTY_PAGE_INFO }),
      });
      state = productsListReducer(state, {
        ...PRODUCTS_LIST_ACTIONS.setQueryFromUrl({
          pageIndex: 1,
          pageSize: 25,
          nameFilter: 'widget',
        }),
      });
      const next = productsListReducer(state, {
        ...PRODUCTS_LIST_ACTIONS.loadProducts(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
      expect(next.fetchedQuery?.pageIndex).toBe(1);
    });

    it('is re-triggerable for the same query after a failure', () => {
      let state = productsListReducer(PRODUCTS_LIST_INITIAL_STATE, {
        ...PRODUCTS_LIST_ACTIONS.loadProducts(),
      });
      state = productsListReducer(state, {
        ...PRODUCTS_LIST_ACTIONS.loadProductsFailure({ error: new Error('boom') }),
      });
      expect(state.fetchedQuery).toBeNull();
      expect(state.request.status).toBe(LOAD_STATUS.Error);
      const next = productsListReducer(state, {
        ...PRODUCTS_LIST_ACTIONS.loadProducts(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });
  });

  describe('loadProductsSuccess', () => {
    it('stores products and paging info and clears the error', () => {
      let state = productsListReducer(PRODUCTS_LIST_INITIAL_STATE, {
        ...PRODUCTS_LIST_ACTIONS.loadProductsFailure({ error: new Error('boom') }),
      });
      const next = productsListReducer(state, {
        ...PRODUCTS_LIST_ACTIONS.loadProductsSuccess({
          products: [PRODUCT],
          info: { length: 25, skip: 0, totalCount: 1 },
        }),
      });
      expect(next.products).toHaveLength(1);
      expect(next.info?.totalCount).toBe(1);
      expect(next.request.status).toBe(LOAD_STATUS.Loaded);
      expect(next.request.error).toBeNull();
    });
  });

  describe('loadProductsFailure', () => {
    it('clears the list, paging info and fetched query', () => {
      let state = productsListReducer(PRODUCTS_LIST_INITIAL_STATE, {
        ...PRODUCTS_LIST_ACTIONS.loadProducts(),
      });
      state = productsListReducer(state, {
        ...PRODUCTS_LIST_ACTIONS.loadProductsSuccess({
          products: [PRODUCT],
          info: { length: 25, skip: 0, totalCount: 1 },
        }),
      });
      const next = productsListReducer(state, {
        ...PRODUCTS_LIST_ACTIONS.loadProductsFailure({ error: new Error('boom') }),
      });
      expect(next.products).toEqual([]);
      expect(next.info).toBeNull();
      expect(next.fetchedQuery).toBeNull();
      expect(next.request.status).toBe(LOAD_STATUS.Error);
    });
  });

  describe('productCreated (local sync, no refetch)', () => {
    const NEW_PRODUCT: Product = {
      id: 'prd_2',
      name: 'Beta Widget',
      price: 200,
      stock: { actualQuantity: 5, reservedQuantity: 0 },
      createdAt: '2026-02-01T00:00:00.000Z',
    };

    function loadedState(overrides: Partial<ProductsListState> = {}): ProductsListState {
      let state = productsListReducer(PRODUCTS_LIST_INITIAL_STATE, {
        ...PRODUCTS_LIST_ACTIONS.loadProducts(),
      });
      state = productsListReducer(state, {
        ...PRODUCTS_LIST_ACTIONS.loadProductsSuccess({
          products: [PRODUCT],
          info: { length: 1, skip: 0, totalCount: 1 },
        }),
      });
      return { ...state, ...overrides };
    }

    it('prepends on top on the first page and silently bumps totalCount', () => {
      const state = loadedState();
      const next = productsListReducer(state, {
        ...PRODUCTS_LIST_ACTIONS.productCreated({ product: NEW_PRODUCT }),
      });
      expect(next.products.map((product) => product.id)).toEqual(['prd_2', 'prd_1']);
      expect(next.info?.totalCount).toBe(2);
      expect(next.info?.length).toBe(2);
      expect(next.request).toBe(state.request);
      expect(next.fetchedQuery).toBe(state.fetchedQuery);
    });

    it('trims to pageSize when the page is full', () => {
      const full = Array.from(
        { length: 25 },
        (_, index) => ({ ...PRODUCT, id: `prd_full_${index}` })
      );
      const state = loadedState({
        products: full,
        info: { length: 25, skip: 0, totalCount: 25 },
      });
      const next = productsListReducer(state, {
        ...PRODUCTS_LIST_ACTIONS.productCreated({ product: NEW_PRODUCT }),
      });
      expect(next.products).toHaveLength(25);
      expect(next.products[0].id).toBe('prd_2');
      expect(next.products.some((product) => product.id === 'prd_full_24')).toBe(false);
      expect(next.info?.totalCount).toBe(26);
      expect(next.info?.length).toBe(25);
    });

    it('only bumps totalCount when not on the first page', () => {
      const state = loadedState({ pageIndex: 1 });
      const next = productsListReducer(state, {
        ...PRODUCTS_LIST_ACTIONS.productCreated({ product: NEW_PRODUCT }),
      });
      expect(next.products).toBe(state.products);
      expect(next.info?.totalCount).toBe(2);
    });

    it('only bumps totalCount when the name does not match the filter', () => {
      const state = loadedState({ nameFilter: 'alpha' });
      const next = productsListReducer(state, {
        ...PRODUCTS_LIST_ACTIONS.productCreated({ product: NEW_PRODUCT }),
      });
      expect(next.products).toBe(state.products);
      expect(next.info?.totalCount).toBe(2);
    });

    it('prepends when the name matches the filter (case-insensitive)', () => {
      const state = loadedState({ nameFilter: 'beta' });
      const next = productsListReducer(state, {
        ...PRODUCTS_LIST_ACTIONS.productCreated({ product: NEW_PRODUCT }),
      });
      expect(next.products[0].id).toBe('prd_2');
    });

    it('returns the same state when the page was never loaded', () => {
      const next = productsListReducer(PRODUCTS_LIST_INITIAL_STATE, {
        ...PRODUCTS_LIST_ACTIONS.productCreated({ product: NEW_PRODUCT }),
      });
      expect(next).toBe(PRODUCTS_LIST_INITIAL_STATE);
    });

    it('returns the same state for a duplicate product id', () => {
      const state = loadedState();
      const next = productsListReducer(state, {
        ...PRODUCTS_LIST_ACTIONS.productCreated({ product: PRODUCT }),
      });
      expect(next).toBe(state);
    });
  });

  describe('productUpdated (local sync, no refetch)', () => {
    const UPDATED_PRODUCT: Product = { ...PRODUCT, name: 'Alpha Widget Pro', price: 150 };

    function loadedState(): ProductsListState {
      let state = productsListReducer(PRODUCTS_LIST_INITIAL_STATE, {
        ...PRODUCTS_LIST_ACTIONS.loadProducts(),
      });
      state = productsListReducer(state, {
        ...PRODUCTS_LIST_ACTIONS.loadProductsSuccess({
          products: [PRODUCT],
          info: { length: 1, skip: 0, totalCount: 1 },
        }),
      });
      return state;
    }

    it('replaces the product in place when it is on the current page', () => {
      const state = loadedState();
      const next = productsListReducer(state, {
        ...PRODUCTS_LIST_ACTIONS.productUpdated({ product: UPDATED_PRODUCT }),
      });
      expect(next.products).toEqual([UPDATED_PRODUCT]);
      expect(next.info?.totalCount).toBe(1);
      expect(next.request).toBe(state.request);
    });

    it('returns the same state when the product is not on the current page', () => {
      const state = loadedState();
      const other: Product = { ...UPDATED_PRODUCT, id: 'prd_other' };
      const next = productsListReducer(state, {
        ...PRODUCTS_LIST_ACTIONS.productUpdated({ product: other }),
      });
      expect(next).toBe(state);
    });

    it('returns the same state when the page was never loaded', () => {
      const next = productsListReducer(PRODUCTS_LIST_INITIAL_STATE, {
        ...PRODUCTS_LIST_ACTIONS.productUpdated({ product: UPDATED_PRODUCT }),
      });
      expect(next).toBe(PRODUCTS_LIST_INITIAL_STATE);
    });
  });
});
