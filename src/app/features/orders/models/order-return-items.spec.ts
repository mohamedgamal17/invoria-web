import { describe, it, expect } from 'vitest';

import { OrderStatus } from './order.entity';
import {
  addAllOrderLinesToReturnDraft,
  canReturnOrderItems,
  clampReturnQuantity,
  isReturnDraftValid,
  mergeReturnDraftLine,
  normalizeReturnDraftForSubmit,
  orderLineSelectOptions,
  validateReturnDraftLine
} from './order-return-items';
import type { UiOrderItem } from './order-ui.model';

const line = (id: string, productId: string, name: string, quantity: number): UiOrderItem => ({
  id,
  productId,
  productName: name,
  quantity,
  price: 10
});

describe('order-return-items', () => {
  it('canReturnOrderItems: true only when Shipped', () => {
    expect(canReturnOrderItems({ status: OrderStatus.Shipped })).toBe(true);
    expect(canReturnOrderItems({ status: OrderStatus.Accepted })).toBe(false);
    expect(canReturnOrderItems({ status: OrderStatus.Completed })).toBe(false);
  });

  it('orderLineSelectOptions: disambiguates duplicate product names by ordered qty', () => {
    const options = orderLineSelectOptions([
      line('line-aaaaaa', 'p1', 'Widget', 2),
      line('line-bbbbbb', 'p1', 'Widget', 1)
    ]);
    expect(options).toHaveLength(2);
    expect(options[0].productName).toBe('Widget (2)');
    expect(options[0].label).toBe('Widget (2)');
    expect(options[1].productName).toBe('Widget (1)');
    expect(options[1].label).toBe('Widget (1)');
  });

  it('orderLineSelectOptions: single line uses plain product name', () => {
    const options = orderLineSelectOptions([line('line-1', 'p1', 'Widget', 3)]);
    expect(options[0].productName).toBe('Widget');
    expect(options[0].label).toBe('Widget');
  });

  it('validateReturnDraftLine: enforces 1..max', () => {
    expect(validateReturnDraftLine(1, 3)).toBe(true);
    expect(validateReturnDraftLine(3, 3)).toBe(true);
    expect(validateReturnDraftLine(0, 3)).toBe(false);
    expect(validateReturnDraftLine(4, 3)).toBe(false);
  });

  it('mergeReturnDraftLine: replaces quantity when same orderItemId', () => {
    const draft = mergeReturnDraftLine([], {
      orderItemId: 'line-1',
      productName: 'A',
      quantity: 1,
      maxQuantity: 3
    });
    const merged = mergeReturnDraftLine(draft, {
      orderItemId: 'line-1',
      productName: 'A',
      quantity: 2,
      maxQuantity: 3
    });
    expect(merged).toHaveLength(1);
    expect(merged[0].quantity).toBe(2);
  });

  it('mergeReturnDraftLine: clamps quantity to max', () => {
    const draft = mergeReturnDraftLine([], {
      orderItemId: 'line-1',
      productName: 'A',
      quantity: 99,
      maxQuantity: 3
    });
    expect(draft[0].quantity).toBe(3);
  });

  it('normalizeReturnDraftForSubmit: sums duplicate lines', () => {
    const request = normalizeReturnDraftForSubmit([
      { orderItemId: 'line-1', productName: 'A', quantity: 1, maxQuantity: 3 },
      { orderItemId: 'line-1', productName: 'A', quantity: 2, maxQuantity: 3 }
    ]);
    expect(request.Items).toEqual([{ OrderItemId: 'line-1', Quantity: 3 }]);
  });

  it('addAllOrderLinesToReturnDraft: fills every line at max qty', () => {
    const items = [line('l1', 'p1', 'A', 2), line('l2', 'p2', 'B', 1)];
    const draft = addAllOrderLinesToReturnDraft([], items);
    expect(draft).toHaveLength(2);
    expect(draft.find((d) => d.orderItemId === 'l1')?.quantity).toBe(2);
    expect(draft.find((d) => d.orderItemId === 'l2')?.quantity).toBe(1);
    expect(isReturnDraftValid(draft)).toBe(true);
  });

  it('clampReturnQuantity: bounds to [1, max]', () => {
    expect(clampReturnQuantity(0, 5)).toBe(1);
    expect(clampReturnQuantity(10, 5)).toBe(5);
  });
});
