import { describe, it, expect } from 'vitest';

import { OrderFullfillmentStatus, OrderStatus } from './order.entity';
import {
  canComplete,
  canDispatch,
  canReopen,
  canShip,
  getAvailableOrderActions,
  orderStatusLabel
} from './order-actions';

describe('order-actions', () => {
  it('canDispatch: true only for Accepted + Allocated', () => {
    expect(
      canDispatch({ status: OrderStatus.Accepted, fullfillmentStatus: OrderFullfillmentStatus.Allocated })
    ).toBe(true);

    expect(
      canDispatch({ status: OrderStatus.Pending, fullfillmentStatus: OrderFullfillmentStatus.Allocated })
    ).toBe(false);

    expect(
      canDispatch({ status: OrderStatus.Accepted, fullfillmentStatus: OrderFullfillmentStatus.Allocating })
    ).toBe(false);
  });

  it('canReopen: false when fulfillment is Dispatched', () => {
    expect(
      canReopen({ status: OrderStatus.Accepted, fullfillmentStatus: OrderFullfillmentStatus.Dispatched })
    ).toBe(false);
  });

  it('canShip: true only for Accepted + Dispatched', () => {
    expect(
      canShip({ status: OrderStatus.Accepted, fullfillmentStatus: OrderFullfillmentStatus.Dispatched })
    ).toBe(true);

    expect(
      canShip({ status: OrderStatus.Shipped, fullfillmentStatus: OrderFullfillmentStatus.Dispatched })
    ).toBe(false);

    expect(
      canShip({ status: OrderStatus.Accepted, fullfillmentStatus: OrderFullfillmentStatus.Allocated })
    ).toBe(false);
  });

  it('canComplete: true only for Shipped + Dispatched', () => {
    expect(
      canComplete({ status: OrderStatus.Shipped, fullfillmentStatus: OrderFullfillmentStatus.Dispatched })
    ).toBe(true);

    expect(
      canComplete({ status: OrderStatus.Accepted, fullfillmentStatus: OrderFullfillmentStatus.Dispatched })
    ).toBe(false);

    expect(
      canComplete({ status: OrderStatus.Shipped, fullfillmentStatus: OrderFullfillmentStatus.Allocated })
    ).toBe(false);
  });

  it('getAvailableOrderActions: ship before complete after dispatch', () => {
    const dispatched = {
      status: OrderStatus.Accepted,
      fullfillmentStatus: OrderFullfillmentStatus.Dispatched
    };
    expect(getAvailableOrderActions(dispatched)).toContain('ship');
    expect(getAvailableOrderActions(dispatched)).not.toContain('complete');

    const shipped = {
      status: OrderStatus.Shipped,
      fullfillmentStatus: OrderFullfillmentStatus.Dispatched
    };
    expect(getAvailableOrderActions(shipped)).toContain('complete');
    expect(getAvailableOrderActions(shipped)).toContain('returnItems');
    expect(getAvailableOrderActions(shipped)).not.toContain('ship');

    const accepted = {
      status: OrderStatus.Accepted,
      fullfillmentStatus: OrderFullfillmentStatus.Dispatched
    };
    expect(getAvailableOrderActions(accepted)).not.toContain('returnItems');
  });

  it('orderStatusLabel: includes SHIPPED', () => {
    expect(orderStatusLabel(OrderStatus.Shipped)).toBe('SHIPPED');
  });
});

