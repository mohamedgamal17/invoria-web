import { createFeature, createReducer, on } from '@ngrx/store';

import {
  INITIAL_ASYNC_REQUEST_STATE,
  applyFailure,
  startLoading,
  type AsyncRequestState,
} from '../../../../shared/models/async-request-state';
import { LOAD_STATUS } from '../../../../shared/models/load-status';
import {
  EMPTY_PRODUCT_ORDERS_AGGREGATE,
  type ProductOrderRowSummary,
  type ProductOrdersAggregateSummary,
} from '../../models/product-order-summary';
import { PRODUCT_ORDERS_ACTIONS } from './product-details-orders.actions';

export const PRODUCT_ORDERS_FEATURE_KEY = 'productDetailsOrders';

export interface ProductOrdersState {
  productId: string;
  /** `false` keeps the fetch idle — orders load only after the Orders tab opens. */
  ordersTabOpened: boolean;
  rows: ProductOrderRowSummary[];
  aggregate: ProductOrdersAggregateSummary;
  /** The product id the current `rows`/`aggregate` were computed for; drives the fetch gate. */
  loadedProductId: string | null;
  request: AsyncRequestState;
}

export const PRODUCT_ORDERS_INITIAL_STATE: ProductOrdersState = {
  productId: '',
  ordersTabOpened: false,
  rows: [],
  aggregate: EMPTY_PRODUCT_ORDERS_AGGREGATE,
  loadedProductId: null,
  request: INITIAL_ASYNC_REQUEST_STATE,
};

export const productOrdersReducer = createReducer(
  PRODUCT_ORDERS_INITIAL_STATE,

  on(PRODUCT_ORDERS_ACTIONS.ordersTabOpened, (state) =>
    state.ordersTabOpened ? state : { ...state, ordersTabOpened: true },
  ),

  on(PRODUCT_ORDERS_ACTIONS.reloadOrders, (state) =>
    state.loadedProductId === null ? state : { ...state, loadedProductId: null },
  ),

  // The state decides whether a real request is needed: the fetch may only go
  // in flight when the tab gate is open, the owning product context is known,
  // nothing is already loading and the summaries are not already loaded.
  on(PRODUCT_ORDERS_ACTIONS.loadOrders, (state) => {
    if (!state.ordersTabOpened || !state.productId) {
      return state;
    }
    if (state.request.status === LOAD_STATUS.Loading) {
      return state;
    }
    if (state.loadedProductId === state.productId) {
      return state;
    }
    return { ...state, request: startLoading(state.request) };
  }),

  on(PRODUCT_ORDERS_ACTIONS.loadOrdersSuccess, (state, { productId, rows, aggregate }) =>
    productId === state.productId
      ? {
          ...state,
          rows,
          aggregate,
          loadedProductId: productId,
          request: { ...state.request, status: LOAD_STATUS.Loaded, error: null },
        }
      : state,
  ),

  on(PRODUCT_ORDERS_ACTIONS.loadOrdersFailure, (state, { error }) => ({
    ...state,
    rows: [],
    aggregate: EMPTY_PRODUCT_ORDERS_AGGREGATE,
    request: applyFailure(state.request, error),
  })),

  on(PRODUCT_ORDERS_ACTIONS.reset, (state, { productId }) =>
    productId === state.productId ? state : { ...PRODUCT_ORDERS_INITIAL_STATE, productId },
  ),
);

export const productOrdersFeature = createFeature({
  name: PRODUCT_ORDERS_FEATURE_KEY,
  reducer: productOrdersReducer,
});
