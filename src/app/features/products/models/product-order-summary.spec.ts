import { describe, expect, it } from 'vitest';

import type { UiOrder } from '../../orders/models/order-ui.model';
import { OrderStatus } from '../../orders/models/order.entity';
import {
  buildProductOrderRowSummary,
  orderReturnSubtotal,
  productReturnSubtotal,
  summarizeProductOrders
} from './product-order-summary';

const baseOrder = (overrides: Partial<UiOrder> = {}): UiOrder => ({
  id: 'ord-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  orderNumber: 'ORD-1',
  customerName: 'Alice',
  totalAmount: 100,
  netOfTotalOrderAmount: 100,
  returnsTotal: 0,
  status: OrderStatus.Completed,
  orderDate: '2026-01-01T00:00:00.000Z',
  items: [
    { id: 'line-a', productId: 'prod-1', productName: 'Widget', quantity: 2, price: 10 },
    { id: 'line-b', productId: 'prod-2', productName: 'Other', quantity: 1, price: 80 }
  ],
  returnItems: [],
  orderAllocated: false,
  ...overrides
});

describe('product-order-summary', () => {
  it('computes product and order return subtotals', () => {
    const order = baseOrder({
      returnItems: [
        {
          orderItemId: 'line-a',
          productName: 'Widget',
          productId: 'prod-1',
          quantity: 1,
          orderedQuantity: 2,
          unitPrice: 10,
          lineReturnTotal: 10
        },
        {
          orderItemId: 'line-b',
          productName: 'Other',
          productId: 'prod-2',
          quantity: 1,
          orderedQuantity: 1,
          unitPrice: 80,
          lineReturnTotal: 80
        }
      ]
    });

    expect(productReturnSubtotal(order, 'prod-1')).toBe(10);
    expect(orderReturnSubtotal(order)).toBe(90);
  });

  it('buildProductOrderRowSummary: net product and order after returns', () => {
    const row = buildProductOrderRowSummary(baseOrder({
      totalAmount: 100,
      returnItems: [
        {
          orderItemId: 'line-a',
          productName: 'Widget',
          productId: 'prod-1',
          quantity: 1,
          orderedQuantity: 2,
          unitPrice: 10,
          lineReturnTotal: 10
        }
      ]
    }), 'prod-1', 'Completed', OrderStatus.Completed);

    expect(row).toEqual({
      orderId: 'ord-1',
      orderNumber: 'ORD-1',
      orderStatusLabel: 'Completed',
      orderStatus: OrderStatus.Completed,
      productLineSubtotal: 20,
      productReturnSubtotal: 10,
      productNetSubtotal: 10,
      orderTotal: 100,
      orderReturnSubtotal: 10,
      orderNetAfterReturns: 90
    });
  });

  it('summarizeProductOrders: skips orders without the product', () => {
    const { rows, aggregate } = summarizeProductOrders(
      [baseOrder(), baseOrder({ id: 'ord-2', orderNumber: 'ORD-2', items: [] })],
      'prod-1',
      () => 'Completed'
    );

    expect(rows).toHaveLength(1);
    expect(aggregate.orderCount).toBe(1);
    expect(aggregate.productLineSubtotalTotal).toBe(20);
  });
});
