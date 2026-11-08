import { createFeature, createReducer, on } from '@ngrx/store';

import {
  INITIAL_ASYNC_REQUEST_STATE,
  applyFailure,
  startLoading,
  type AsyncRequestState,
} from '../../../../shared/models/async-request-state';
import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { Product } from '../../models/product.entity';
import { PRODUCT_MUTATIONS_ACTIONS } from '../products-mutations/products-mutations.actions';
import { PRODUCT_DETAILS_ACTIONS } from './product-details.actions';

export const PRODUCT_DETAILS_FEATURE_KEY = 'productDetails';

/** Tabs of the product details page. Values double as URL query slugs. */
export enum ProductDetailsTab {
  Info = 'info',
  Batches = 'batches',
  Orders = 'orders',
}

export interface ProductDetailsState {
  productId: string | null;
  product: Product | null;
  activeTab: ProductDetailsTab;
  request: AsyncRequestState;
}

export const PRODUCT_DETAILS_INITIAL_STATE: ProductDetailsState = {
  productId: null,
  product: null,
  activeTab: ProductDetailsTab.Info,
  request: INITIAL_ASYNC_REQUEST_STATE,
};

export const productDetailsReducer = createReducer(
  PRODUCT_DETAILS_INITIAL_STATE,

  on(PRODUCT_DETAILS_ACTIONS.loadProduct, (state, { productId }) => ({
    ...state,
    productId,
    product: null,
    request: startLoading(state.request),
  })),

  // Background refresh of the same product: the entity stays visible while the
  // aggregate values are being refetched.
  on(PRODUCT_DETAILS_ACTIONS.refreshProduct, (state, { productId }) =>
    productId === state.productId
      ? { ...state, request: startLoading(state.request) }
      : state,
  ),

  on(PRODUCT_DETAILS_ACTIONS.loadProductSuccess, (state, { product }) => ({
    ...state,
    product,
    request: { ...state.request, status: LOAD_STATUS.Loaded, error: null },
  })),

  on(PRODUCT_DETAILS_ACTIONS.loadProductFailure, (state, { error }) => ({
    ...state,
    product: null,
    request: applyFailure(state.request, error),
  })),

  on(PRODUCT_DETAILS_ACTIONS.setActiveTab, (state, { activeTab }) =>
    activeTab === state.activeTab ? state : { ...state, activeTab },
  ),

  /**
   * Silent cross-slice sync: the same product was updated through the edit
   * form (`products-mutations`); the details store folds the returned entity
   * in without a refetch. Products the store is not holding are ignored.
   */
  on(PRODUCT_MUTATIONS_ACTIONS.updateProductSuccess, (state, { product }) =>
    state.product !== null && state.product.id === product.id
      ? { ...state, product }
      : state,
  ),
);

export const productDetailsFeature = createFeature({
  name: PRODUCT_DETAILS_FEATURE_KEY,
  reducer: productDetailsReducer,
});
