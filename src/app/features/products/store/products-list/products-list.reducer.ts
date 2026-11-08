import { createFeature, createReducer, on } from '@ngrx/store';

import type { PagingInfo } from '../../../../core/models/paging';
import {
  INITIAL_ASYNC_REQUEST_STATE,
  applyFailure,
  startLoading,
  type AsyncRequestState,
} from '../../../../shared/models/async-request-state';
import type { Product } from '../../models/product.entity';
import { PRODUCTS_LIST_ACTIONS } from './products-list.actions';

export const PRODUCTS_LIST_FEATURE_KEY = 'productsList';

export interface ProductsListState {
  /** 0-based page index, observed from the `page` query param (1-based there). */
  pageIndex: number;
  /** Page size, observed from the `pageSize` query param. */
  pageSize: number;
  /** Normalized name filter, observed from the `name` query param. */
  nameFilter: string;
  /** The exact fetch identity (normalized) behind the current data — in-flight or loaded. */
  fetchedQuery: ProductsListQuery | null;
  /** Products for the CURRENT api page. */
  products: Product[];
  /** API paging details of the current page. */
  info: PagingInfo | null;
  request: AsyncRequestState;
}

/** Normalized identifier of one products fetch: paging plus the name filter. */
export interface ProductsListQuery {
  pageIndex: number;
  pageSize: number;
  nameFilter: string;
}

/** Builds the fetch identity from the current state. */
function queryFromState(state: ProductsListState): ProductsListQuery {
  return {
    pageIndex: state.pageIndex,
    pageSize: state.pageSize,
    nameFilter: state.nameFilter,
  };
}

export function sameQuery(left: ProductsListQuery | null, right: ProductsListQuery): boolean {
  return (
    left !== null &&
    left.pageIndex === right.pageIndex &&
    left.pageSize === right.pageSize &&
    left.nameFilter === right.nameFilter
  );
}

export const PRODUCTS_LIST_INITIAL_STATE: ProductsListState = {
  pageIndex: 0,
  pageSize: 25,
  nameFilter: '',
  fetchedQuery: null,
  products: [],
  info: null,
  request: INITIAL_ASYNC_REQUEST_STATE,
};

export const productsListReducer = createReducer(
  PRODUCTS_LIST_INITIAL_STATE,

  on(PRODUCTS_LIST_ACTIONS.setQueryFromUrl, (state, { pageIndex, pageSize, nameFilter }) => {
    const normalizedFilter = nameFilter.trim();
    if (
      pageIndex === state.pageIndex &&
      pageSize === state.pageSize &&
      normalizedFilter === state.nameFilter
    ) {
      return state;
    }
    return { ...state, pageIndex, pageSize, nameFilter: normalizedFilter };
  }),

  // The state decides whether a real request is needed: the fetch may only go
  // in flight when the query differs from the one being fetched/loaded.
  on(PRODUCTS_LIST_ACTIONS.loadProducts, (state) => {
    const query = queryFromState(state);
    if (sameQuery(state.fetchedQuery, query)) {
      return state;
    }
    return { ...state, request: startLoading(state.request), fetchedQuery: query };
  }),

  on(PRODUCTS_LIST_ACTIONS.loadProductsSuccess, (state, { products, info }) => ({
    ...state,
    products,
    info,
    request: { ...state.request, status: 'loaded' as const, error: null },
  })),

  on(PRODUCTS_LIST_ACTIONS.loadProductsFailure, (state, { error }) => ({
    ...state,
    products: [],
    info: null,
    fetchedQuery: null,
    request: applyFailure(state.request, error),
  })),

  // Local mutation sync: prepend a newly created product on top of the current
  // page without refetching. Only visible on the first page when the name
  // matches the active filter; the paging total is always bumped silently.
  on(PRODUCTS_LIST_ACTIONS.productCreated, (state, { product }) => {
    if (state.info === null || state.fetchedQuery === null) {
      return state;
    }
    if (state.products.some((item) => item.id === product.id)) {
      return state;
    }
    const matchesFilter =
      !state.nameFilter || product.name.toLowerCase().includes(state.nameFilter.toLowerCase());
    const shouldPrepend = state.pageIndex === 0 && matchesFilter;
    const products = shouldPrepend
      ? [product, ...state.products].slice(0, state.pageSize)
      : state.products;
    return {
      ...state,
      products,
      info: {
        ...state.info,
        totalCount: state.info.totalCount + 1,
        length: Math.min(products.length, state.pageSize),
      },
    };
  }),

  // Local mutation sync: replace the current product in place if it is on the
  // current page; otherwise ignore it (the next fetch will include it).
  on(PRODUCTS_LIST_ACTIONS.productUpdated, (state, { product }) => {
    if (state.info === null) {
      return state;
    }
    if (!state.products.some((item) => item.id === product.id)) {
      return state;
    }
    return {
      ...state,
      products: state.products.map((item) => (item.id === product.id ? product : item)),
    };
  }),

  // Local mutation sync: remove the deleted product from the current page if
  // present (the next fetch will not include it); the paging total is decremented silently.
  on(PRODUCTS_LIST_ACTIONS.productDeleted, (state, { id }) => {
    if (state.info === null) {
      return state;
    }
    if (!state.products.some((item) => item.id === id)) {
      return state;
    }
    const products = state.products.filter((item) => item.id !== id);
    return {
      ...state,
      products,
      info: {
        ...state.info,
        totalCount: Math.max(state.info.totalCount - 1, 0),
        length: Math.min(products.length, state.pageSize),
      },
    };
  }),
);

export const productsListFeature = createFeature({
  name: PRODUCTS_LIST_FEATURE_KEY,
  reducer: productsListReducer,
});
