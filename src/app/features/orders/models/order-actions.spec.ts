import { describe, it, expect } from 'vitest';

import { OrderFullfillmentStatus, OrderStatus } from './order.entity';
import { canDispatch, canReopen } from './order-actions';

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
});

