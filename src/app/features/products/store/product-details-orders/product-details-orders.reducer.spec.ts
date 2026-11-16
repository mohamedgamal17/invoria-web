import { describe, expect, it } from 'vitest';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import { OrderStatus } from '../../../orders/models/order.entity';
import { PRODUCT_ORDERS_ACTIONS } from './product-details-orders.actions';
import {
  PRODUCT_ORDERS_INITIAL_STATE,
  productOrdersReducer,
  type ProductOrdersState,
} from './product-details-orders.reducer';
import type { ProductOrderRowSummary } from '../../models/product-order-summary';

const ROW: ProductOrderRowSummary = {
  orderId: 'ord_1',
  orderNumber: 'ORD-1',
  orderStatusLabel: 'Completed',
  orderStatus: OrderStatus.Completed,
  productLineSubtotal: 100,
  productReturnSubtotal: 10,
  productNetSubtotal: 90,
  orderTotal: 200,
  orderReturnSubtotal: 20,
  orderNetAfterReturns: 180,
};

/** Initial state with the product context and the tab gate open — preconditions for any fetch. */
function primedState(): ProductOrdersState {
  return productOrdersReducer(
    productOrdersReducer(PRODUCT_ORDERS_INITIAL_STATE, {
      ...PRODUCT_ORDERS_ACTIONS.reset({ productId: 'prd_1' }),
    }),
    { ...PRODUCT_ORDERS_ACTIONS.ordersTabOpened() },
  );
}

describe('productOrdersReducer', () => {
  describe('loadOrders (the state decides whether the API is called)', () => {
    it('stays idle when the tab gate is closed', () => {
      const primed = productOrdersReducer(PRODUCT_ORDERS_INITIAL_STATE, {
        ...PRODUCT_ORDERS_ACTIONS.reset({ productId: 'prd_1' }),
      });
      const next = productOrdersReducer(primed, { ...PRODUCT_ORDERS_ACTIONS.loadOrders() });
      expect(next).toBe(primed);
      expect(next.request.status).toBe(LOAD_STATUS.Idle);
    });

    it('stays idle while the product context is unknown', () => {
      const state = productOrdersReducer(PRODUCT_ORDERS_INITIAL_STATE, {
        ...PRODUCT_ORDERS_ACTIONS.ordersTabOpened(),
      });
      const next = productOrdersReducer(state, { ...PRODUCT_ORDERS_ACTIONS.loadOrders() });
      expect(next.request.status).toBe(LOAD_STATUS.Idle);
    });

    it('starts loading on the first trigger', () => {
      const next = productOrdersReducer(primedState(), {
        ...PRODUCT_ORDERS_ACTIONS.loadOrders(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
      expect(next.loadedProductId).toBeNull();
    });

    it('does not start a second request once the summaries are loaded', () => {
      let state = productOrdersReducer(primedState(), {
        ...PRODUCT_ORDERS_ACTIONS.loadOrders(),
      });
      state = productOrdersReducer(state, {
        ...PRODUCT_ORDERS_ACTIONS.loadOrdersSuccess({
          productId: 'prd_1',
          rows: [ROW],
          aggregate: {
            orderCount: 1,
            productLineSubtotalTotal: 100,
            productReturnSubtotalTotal: 10,
            productNetSubtotalTotal: 90,
            orderTotalSum: 200,
            orderReturnSubtotalSum: 20,
            orderNetAfterReturnsSum: 180,
          },
        }),
      });
      const next = productOrdersReducer(state, { ...PRODUCT_ORDERS_ACTIONS.loadOrders() });
      expect(next).toBe(state);
      expect(next.request.status).toBe(LOAD_STATUS.Loaded);
    });

    it('does not restart an in-flight request', () => {
      const state = productOrdersReducer(primedState(), {
        ...PRODUCT_ORDERS_ACTIONS.loadOrders(),
      });
      const next = productOrdersReducer(state, { ...PRODUCT_ORDERS_ACTIONS.loadOrders() });
      expect(next).toBe(state);
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });

    it('is re-triggerable after a failure', () => {
      let state = productOrdersReducer(primedState(), {
        ...PRODUCT_ORDERS_ACTIONS.loadOrders(),
      });
      state = productOrdersReducer(state, {
        ...PRODUCT_ORDERS_ACTIONS.loadOrdersFailure({ error: new Error('boom') }),
      });
      expect(state.request.status).toBe(LOAD_STATUS.Error);
      const next = productOrdersReducer(state, { ...PRODUCT_ORDERS_ACTIONS.loadOrders() });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });
  });

  describe('reloadOrders', () => {
    it('clears the loaded marker so the next trigger refetches', () => {
      let state = productOrdersReducer(primedState(), {
        ...PRODUCT_ORDERS_ACTIONS.loadOrders(),
      });
      state = productOrdersReducer(state, {
        ...PRODUCT_ORDERS_ACTIONS.loadOrdersSuccess({
          productId: 'prd_1',
          rows: [ROW],
          aggregate: {
            orderCount: 1,
            productLineSubtotalTotal: 100,
            productReturnSubtotalTotal: 10,
            productNetSubtotalTotal: 90,
            orderTotalSum: 200,
            orderReturnSubtotalSum: 20,
            orderNetAfterReturnsSum: 180,
          },
        }),
      });
      const reloaded = productOrdersReducer(state, {
        ...PRODUCT_ORDERS_ACTIONS.reloadOrders(),
      });
      expect(reloaded.loadedProductId).toBeNull();
      expect(reloaded.rows).toHaveLength(1);
      const next = productOrdersReducer(reloaded, { ...PRODUCT_ORDERS_ACTIONS.loadOrders() });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });
  });

  describe('loadOrdersSuccess', () => {
    it('stores the rows and the aggregate for the owning product', () => {
      const loading = productOrdersReducer(primedState(), {
        ...PRODUCT_ORDERS_ACTIONS.loadOrders(),
      });
      const next = productOrdersReducer(loading, {
        ...PRODUCT_ORDERS_ACTIONS.loadOrdersSuccess({
          productId: 'prd_1',
          rows: [ROW],
          aggregate: {
            orderCount: 1,
            productLineSubtotalTotal: 100,
            productReturnSubtotalTotal: 10,
            productNetSubtotalTotal: 90,
            orderTotalSum: 200,
            orderReturnSubtotalSum: 20,
            orderNetAfterReturnsSum: 180,
          },
        }),
      });
      expect(next.rows).toEqual([ROW]);
      expect(next.aggregate.orderCount).toBe(1);
      expect(next.loadedProductId).toBe('prd_1');
      expect(next.request.status).toBe(LOAD_STATUS.Loaded);
    });

    it('ignores a response for a product that is no longer the current one', () => {
      const state = productOrdersReducer(primedState(), {
        ...PRODUCT_ORDERS_ACTIONS.loadOrders(),
      });
      const next = productOrdersReducer(state, {
        ...PRODUCT_ORDERS_ACTIONS.loadOrdersSuccess({
          productId: 'prd_stale',
          rows: [ROW],
          aggregate: {
            orderCount: 1,
            productLineSubtotalTotal: 100,
            productReturnSubtotalTotal: 10,
            productNetSubtotalTotal: 90,
            orderTotalSum: 200,
            orderReturnSubtotalSum: 20,
            orderNetAfterReturnsSum: 180,
          },
        }),
      });
      expect(next).toBe(state);
    });
  });

  describe('reset', () => {
    it('clears the slice for the incoming product id', () => {
      let state = productOrdersReducer(primedState(), {
        ...PRODUCT_ORDERS_ACTIONS.loadOrders(),
      });
      state = productOrdersReducer(state, {
        ...PRODUCT_ORDERS_ACTIONS.reset({ productId: 'prd_2' }),
      });
      expect(state.productId).toBe('prd_2');
      expect(state.ordersTabOpened).toBe(false);
      expect(state.rows).toEqual([]);
      expect(state.loadedProductId).toBeNull();
      expect(state.request.status).toBe(LOAD_STATUS.Idle);
    });

    it('keeps the current state when the same product id is reset again', () => {
      const state = primedState();
      const next = productOrdersReducer(state, {
        ...PRODUCT_ORDERS_ACTIONS.reset({ productId: 'prd_1' }),
      });
      expect(next).toBe(state);
    });
  });
});
