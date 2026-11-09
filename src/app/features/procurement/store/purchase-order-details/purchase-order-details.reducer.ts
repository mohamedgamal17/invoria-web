import { createFeature, createReducer, on } from '@ngrx/store';

import {
  INITIAL_ASYNC_REQUEST_STATE,
  applyFailure,
  startLoading,
  type AsyncRequestState,
} from '../../../../shared/models/async-request-state';
import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { PurchaseOrder } from '../../models/purchase-order.entity';
import { PURCHASE_ORDERS_MUTATIONS_ACTIONS } from '../purchase-orders-mutations/purchase-orders-mutations.actions';
import { PURCHASE_ORDER_DETAILS_ACTIONS } from './purchase-order-details.actions';

export const PURCHASE_ORDER_DETAILS_FEATURE_KEY = 'purchaseOrderDetails';

/** Tabs of the purchase order details page. Values double as URL query slugs. */
export enum PurchaseOrderDetailsTab {
  Overview = 'overview',
  Lines = 'lines',
  History = 'history',
}

export interface PurchaseOrderDetailsState {
  purchaseOrderId: string | null;
  purchaseOrder: PurchaseOrder | null;
  activeTab: PurchaseOrderDetailsTab;
  request: AsyncRequestState;
  /** Resolved catalog names keyed by `productId` when the line item has no `productName`. */
  productNamesById: ReadonlyMap<string, string>;
}

export const PURCHASE_ORDER_DETAILS_INITIAL_STATE: PurchaseOrderDetailsState = {
  purchaseOrderId: null,
  purchaseOrder: null,
  activeTab: PurchaseOrderDetailsTab.Overview,
  request: INITIAL_ASYNC_REQUEST_STATE,
  productNamesById: new Map<string, string>(),
};

export const purchaseOrderDetailsReducer = createReducer(
  PURCHASE_ORDER_DETAILS_INITIAL_STATE,

  on(PURCHASE_ORDER_DETAILS_ACTIONS.loadPurchaseOrder, (state, { purchaseOrderId }) => ({
    ...state,
    purchaseOrderId,
    purchaseOrder: null,
    productNamesById: new Map<string, string>(),
    request: startLoading(state.request),
  })),

  on(PURCHASE_ORDER_DETAILS_ACTIONS.loadPurchaseOrderSuccess, (state, { purchaseOrder }) => ({
    ...state,
    purchaseOrder,
    request: { ...state.request, status: LOAD_STATUS.Loaded, error: null },
  })),

  on(PURCHASE_ORDER_DETAILS_ACTIONS.loadPurchaseOrderFailure, (state, { error }) => ({
    ...state,
    purchaseOrder: null,
    productNamesById: new Map<string, string>(),
    request: applyFailure(state.request, error),
  })),

  on(PURCHASE_ORDER_DETAILS_ACTIONS.setActiveTab, (state, { activeTab }) =>
    activeTab === state.activeTab ? state : { ...state, activeTab },
  ),

  on(PURCHASE_ORDER_DETAILS_ACTIONS.productNamesResolved, (state, { names }) => ({
    ...state,
    productNamesById: names,
  })),

  /**
   * Silent cross-slice sync: the same purchase order was mutated through a state
   * transition (`purchase-orders-mutations`); the details store folds the returned
   * entity in without a refetch. Purchase orders the store is not holding are ignored.
   */
  on(
    PURCHASE_ORDERS_MUTATIONS_ACTIONS.transitionPurchaseOrderSuccess,
    (state, { purchaseOrder }) =>
      state.purchaseOrder !== null && state.purchaseOrder.id === purchaseOrder.id
        ? { ...state, purchaseOrder }
        : state,
  ),
);

export const purchaseOrderDetailsFeature = createFeature({
  name: PURCHASE_ORDER_DETAILS_FEATURE_KEY,
  reducer: purchaseOrderDetailsReducer,
});
