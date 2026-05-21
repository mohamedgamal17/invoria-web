import { OrderStatus } from './order.entity';
import type { AddReturnItemsRequest } from './add-return-items.request';
import type { UiOrderItem, UiReturnItem } from './order-ui.model';

type OrderLike = { status: OrderStatus };

export type ReturnOrderLineOption = {
  orderItemId: string;
  label: string;
  maxQuantity: number;
  productName: string;
};

export type ReturnDraftLine = {
  orderItemId: string;
  productName: string;
  quantity: number;
  maxQuantity: number;
};

export function mapReturnItemsToDraft(returnItems: UiReturnItem[]): ReturnDraftLine[] {
  return returnItems.map((row) => ({
    orderItemId: row.orderItemId,
    productName: row.productName,
    quantity: row.quantity,
    maxQuantity: row.orderedQuantity
  }));
}

export function canReturnOrderItems(order: OrderLike): boolean {
  return order.status === OrderStatus.Shipped;
}

function resolveLineProductName(item: UiOrderItem): string {
  return item.productName?.trim() || item.productId;
}

export function orderLineSelectOptions(items: UiOrderItem[]): ReturnOrderLineOption[] {
  const nameCounts = new Map<string, number>();
  for (const item of items) {
    const name = resolveLineProductName(item);
    nameCounts.set(name, (nameCounts.get(name) ?? 0) + 1);
  }

  return items.map((item) => {
    const baseName = resolveLineProductName(item);
    const ambiguous = (nameCounts.get(baseName) ?? 0) > 1;
    const productName = ambiguous ? `${baseName} (${item.quantity})` : baseName;
    return {
      orderItemId: item.id,
      productName,
      maxQuantity: item.quantity,
      label: productName
    };
  });
}

export function hasDuplicateProductNamesInDraft(draft: ReturnDraftLine[]): boolean {
  const names = draft.map((row) => row.productName);
  return new Set(names).size !== names.length;
}

export function validateReturnDraftLine(quantity: number, maxQuantity: number): boolean {
  return Number.isInteger(quantity) && quantity >= 1 && quantity <= maxQuantity;
}

export function clampReturnQuantity(quantity: number, maxQuantity: number): number {
  if (!Number.isFinite(quantity)) {
    return 1;
  }
  const rounded = Math.round(quantity);
  return Math.min(maxQuantity, Math.max(1, rounded));
}

export function mergeReturnDraftLine(
  draft: ReturnDraftLine[],
  line: { orderItemId: string; productName: string; quantity: number; maxQuantity: number }
): ReturnDraftLine[] {
  const quantity = clampReturnQuantity(line.quantity, line.maxQuantity);
  const existing = draft.find((d) => d.orderItemId === line.orderItemId);
  if (existing) {
    return draft.map((d) =>
      d.orderItemId === line.orderItemId
        ? { ...d, quantity, productName: line.productName, maxQuantity: line.maxQuantity }
        : d
    );
  }
  return [...draft, { orderItemId: line.orderItemId, productName: line.productName, quantity, maxQuantity: line.maxQuantity }];
}

export function normalizeReturnDraftForSubmit(draft: ReturnDraftLine[]): AddReturnItemsRequest {
  const byLine = new Map<string, number>();
  for (const row of draft) {
    if (!validateReturnDraftLine(row.quantity, row.maxQuantity)) {
      continue;
    }
    const capped = clampReturnQuantity(row.quantity, row.maxQuantity);
    byLine.set(row.orderItemId, (byLine.get(row.orderItemId) ?? 0) + capped);
  }

  return {
    Items: [...byLine.entries()].map(([OrderItemId, Quantity]) => ({ OrderItemId, Quantity }))
  };
}

export function isReturnDraftValid(draft: ReturnDraftLine[]): boolean {
  return draft.length > 0 && draft.every((row) => validateReturnDraftLine(row.quantity, row.maxQuantity));
}

export function mapReturnItemsRequestToUi(
  request: AddReturnItemsRequest,
  orderItems: UiOrderItem[]
): UiReturnItem[] {
  const byLineId = new Map(orderItems.map((item) => [item.id, item]));

  return (request.Items ?? []).map((line) => {
    const orderLine = byLineId.get(line.OrderItemId);
    const unitPrice = orderLine?.price ?? 0;
    const orderedQuantity = orderLine?.quantity ?? 0;
    const productName = orderLine
      ? resolveLineProductName(orderLine)
      : `Line ${line.OrderItemId}`;

    return {
      orderItemId: line.OrderItemId,
      productName,
      quantity: line.Quantity,
      orderedQuantity,
      unitPrice,
      lineTotal: unitPrice * line.Quantity
    };
  });
}

export function addAllOrderLinesToReturnDraft(
  draft: ReturnDraftLine[],
  items: UiOrderItem[]
): ReturnDraftLine[] {
  let next = draft;
  for (const item of items) {
    next = mergeReturnDraftLine(next, {
      orderItemId: item.id,
      productName: resolveLineProductName(item),
      quantity: item.quantity,
      maxQuantity: item.quantity
    });
  }
  return next;
}
