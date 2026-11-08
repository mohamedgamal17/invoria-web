import { describe, expect, it } from 'vitest';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import { OrderStatus } from '../../models/order.entity';
import { PaymentStatus, PaymentType } from '../../models/order-payment.enums';
import type { UiOrder } from '../../models/order-ui.model';
import { ORDER_DETAILS_ACTIONS } from './order-details.actions';
import {
  ORDER_DETAILS_INITIAL_STATE,
  orderDetailsReducer,
  type OrderDetailsState,
} from './order-details.reducer';

const ORDER: UiOrder = {
  id: 'ord_1',
  createdAt: '2026-01-01T00:00:00.000Z',
  orderNumber: 'ORD-42',
  customerName: 'Alice',
  netOfTotalOrderAmount: 100,
  returnsTotal: 0,
  status: OrderStatus.Pending,
  paymentType: PaymentType.Immediate,
  paymentStatus: PaymentStatus.Paid,
  orderDate: '2026-01-01T00:00:00.000Z',
  items: [],
  returnItems: [],
  orderAllocated: false,
};

const UPDATED: UiOrder = { ...ORDER, status: OrderStatus.Processing };

const LOADED: OrderDetailsState = {
  ...ORDER_DETAILS_INITIAL_STATE,
  orderId: 'ord_1',
  order: ORDER,
  request: { ...ORDER_DETAILS_INITIAL_STATE.request, status: LOAD_STATUS.Loaded },
};

describe('orderDetailsReducer', () => {
  describe('setActiveTab', () => {
    it('returns the same state object for an identical tab', () => {
      const primed = { ...LOADED, activeTab: 2 };
      expect(
        orderDetailsReducer(primed, { ...ORDER_DETAILS_ACTIONS.setActiveTab({ activeTab: 2 }) }),
      ).toBe(primed);
    });

    it('applies a real tab change', () => {
      const next = orderDetailsReducer(
        LOADED,
        { ...ORDER_DETAILS_ACTIONS.setActiveTab({ activeTab: 3 }) },
      );
      expect(next.activeTab).toBe(3);
      expect(next.order).toBe(ORDER);
    });
  });

  describe('loadOrder', () => {
    it('resets the entity and starts loading', () => {
      const next = orderDetailsReducer(
        LOADED,
        { ...ORDER_DETAILS_ACTIONS.loadOrder({ orderId: 'ord_2' }) },
      );
      expect(next.orderId).toBe('ord_2');
      expect(next.order).toBeNull();
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });

    it('resets the tab only when switching orders', () => {
      const primed = { ...LOADED, activeTab: 2 };
      const same = orderDetailsReducer(
        primed,
        { ...ORDER_DETAILS_ACTIONS.loadOrder({ orderId: 'ord_1' }) },
      );
      expect(same.activeTab).toBe(2);
      const other = orderDetailsReducer(
        primed,
        { ...ORDER_DETAILS_ACTIONS.loadOrder({ orderId: 'ord_2' }) },
      );
      expect(other.activeTab).toBe(0);
    });
  });

  describe('refreshOrder', () => {
    it('keeps the entity visible for the same order', () => {
      const next = orderDetailsReducer(
        LOADED,
        { ...ORDER_DETAILS_ACTIONS.refreshOrder({ orderId: 'ord_1' }) },
      );
      expect(next.order).toBe(ORDER);
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });

    it('ignores a foreign id', () => {
      const next = orderDetailsReducer(
        LOADED,
        { ...ORDER_DETAILS_ACTIONS.refreshOrder({ orderId: 'ord_2' }) },
      );
      expect(next).toBe(LOADED);
    });
  });

  describe('load success / failure', () => {
    it('settles the request and folds the entity in', () => {
      const next = orderDetailsReducer(
        { ...ORDER_DETAILS_INITIAL_STATE, orderId: 'ord_1' },
        { ...ORDER_DETAILS_ACTIONS.loadOrderSuccess({ order: ORDER }) },
      );
      expect(next.order).toBe(ORDER);
      expect(next.request.status).toBe(LOAD_STATUS.Loaded);
      expect(next.request.error).toBeNull();
    });

    it('applies failure detail and bumps the nonce', () => {
      const next = orderDetailsReducer(
        { ...ORDER_DETAILS_INITIAL_STATE, orderId: 'ord_1' },
        { ...ORDER_DETAILS_ACTIONS.loadOrderFailure({ error: new Error('boom') }) },
      );
      expect(next.order).toBeNull();
      expect(next.request.status).toBe(LOAD_STATUS.Error);
      expect(next.request.failureNonce).toBe(1);
      expect(next.request.error).toBeTruthy();
    });
  });

  describe('recordAction', () => {
    it('starts the saving request and records the last action without touching the load slice', () => {
      const next = orderDetailsReducer(
        LOADED,
        { ...ORDER_DETAILS_ACTIONS.recordAction({ action: 'accept', orderId: 'ord_1' }) },
      );
      expect(next.lastAction).toBe('accept');
      expect(next.savingRequest.status).toBe(LOAD_STATUS.Loading);
      expect(next.request.status).toBe(LOAD_STATUS.Loaded);
      expect(next.order).toBe(ORDER);
    });

    it('folds the returned entity and bumps the success nonce', () => {
      const saving = orderDetailsReducer(
        LOADED,
        { ...ORDER_DETAILS_ACTIONS.recordAction({ action: 'complete', orderId: 'ord_1' }) },
      );
      const next = orderDetailsReducer(
        saving,
        { ...ORDER_DETAILS_ACTIONS.recordActionSuccess({ action: 'complete', order: UPDATED }) },
      );
      expect(next.order).toBe(UPDATED);
      expect(next.savingRequest.status).toBe(LOAD_STATUS.Loaded);
      expect(next.savingRequest.error).toBeNull();
      expect(next.successNonce).toBe(saving.successNonce + 1);
    });

    it('applies failure without clearing the loaded entity', () => {
      const saving = orderDetailsReducer(
        LOADED,
        { ...ORDER_DETAILS_ACTIONS.recordAction({ action: 'cancel', orderId: 'ord_1' }) },
      );
      const next = orderDetailsReducer(
        saving,
        { ...ORDER_DETAILS_ACTIONS.recordActionFailure({ error: new Error('boom') }) },
      );
      expect(next.order).toBe(ORDER);
      expect(next.savingRequest.status).toBe(LOAD_STATUS.Error);
      expect(next.savingRequest.failureNonce).toBe(1);
      expect(next.savingRequest.error).toBeTruthy();
      expect(next.successNonce).toBe(0);
    });
  });
});
