import { describe, expect, it } from 'vitest';

import type { UiOrder } from '@invoria/sales';
import { OrderStatus } from '@invoria/sales';
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
  netOfTotalOrderAmount: 100,
  returnsTotal: 0,
  status: OrderStatus.Completed,
  orderDate: '2026-01-01T00:00:00.000Z',
  items: [
    {
      id: 'line-a',
      productId: 'prod-1',
      quantity: 2,
      price: 10,
      product: {
        id: 'prod-1',
        name: 'Widget',
        price: 10,
        stock: { actualQuantity: 0, reservedQuantity: 0 },
        createdAt: ''
      }
    },
    {
      id: 'line-b',
      productId: 'prod-2',
      quantity: 1,
      price: 80,
      product: {
        id: 'prod-2',
        name: 'Other',
        price: 80,
        stock: { actualQuantity: 0, reservedQuantity: 0 },
        createdAt: ''
      }
    }
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
          productId: 'prod-1',
          quantity: 1,
          orderedQuantity: 2,
          unitPrice: 10,
          lineReturnTotal: 10
        },
        {
          orderItemId: 'line-b',
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
      netOfTotalOrderAmount: 90,
      returnItems: [
        {
          orderItemId: 'line-a',
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
      orderTotal: 90,
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
