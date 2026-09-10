import type { CreateOrderLineItemRequest } from './create-order-line-item.request';
import type { Order, OrderItem, OrderReturnItem } from './order.entity';
import type { UiOrder, UiOrderItem, UiReturnItem } from './order-ui.model';

function toNumber(v: unknown): number {
  if (v === null || v === undefined || v === '') return 0;
  const n = typeof v === 'string' ? Number(v) : (v as number);
  return Number.isFinite(n) ? n : 0;
}

function readNumber(raw: any, camel: string, pascal: string): number {
  return toNumber(raw[camel] ?? raw[pascal]);
}

function orderItemToUiItem(line: any): UiOrderItem {
  return {
    id: line.id ?? line.Id ?? '',
    productId: line.productId ?? line.ProductId ?? '',
    productName: line.product?.name?.trim() ?? line.Product?.Name?.trim() ?? line.productId ?? line.ProductId ?? '',
    quantity: toNumber(line.quantity ?? line.Quantity),
    price: toNumber(line.price ?? line.Price)
  };
}

function mapReturnItems(items: any[]): UiReturnItem[] {
  if (!Array.isArray(items)) return [];
  return items.map((r: any) => ({
    orderItemId: r.orderItemId ?? r.OrderItemId ?? '',
    productName: r.product?.name?.trim() ?? r.Product?.Name?.trim() ?? r.productId ?? r.ProductId ?? '',
    productId: r.productId ?? r.ProductId ?? '',
    quantity: toNumber(r.quantity ?? r.Quantity),
    orderedQuantity: toNumber(r.orderedQuantity ?? r.OrderedQuantity),
    unitPrice: toNumber(r.unitPrice ?? r.UnitPrice),
    lineReturnTotal: toNumber(r.lineReturnTotal ?? r.LineReturnTotal)
  }));
}

export function orderToUiOrder(order: Order): UiOrder {
  const raw: any = order as any;
  const rawItems = raw.items ?? raw.Items ?? [];
  const rawReturnItems = raw.returnItems ?? raw.ReturnItems ?? [];
  const items = rawItems.map(orderItemToUiItem);
  const derivedFromItems = items.reduce((sum: number, it: UiOrderItem) => sum + it.price * it.quantity, 0);

  const nNet = readNumber(raw, 'netOrderAmount', 'NetOrderAmount');
  const nSub = readNumber(raw, 'subtotalAmount', 'SubtotalAmount');
  const nDue = readNumber(raw, 'amountDue', 'AmountDue');
  const nReturns = readNumber(raw, 'returnsAmount', 'ReturnsAmount');
  // Dev API may return net as 0 for pending orders — fall back to subtotal / amountDue / items sum so table never stays 0.00 when data exists
  const safeNet = nNet !== 0 ? nNet : nSub !== 0 ? nSub : nDue !== 0 ? nDue : derivedFromItems;

  return {
    id: raw.id ?? raw.Id ?? '',
    createdAt: raw.createdAt ?? raw.CreatedAt ?? '',
    createdBy: raw.createdBy ?? raw.CreatedBy,
    lastModifiedAt: raw.lastModifiedAt ?? raw.LastModifiedAt,
    lastModifiedBy: raw.lastModifiedBy ?? raw.LastModifiedBy,
    orderNumber: raw.orderNumber ?? raw.OrderNumber ?? '',
    customerId: raw.customerId ?? raw.CustomerId ?? '',
    customerName: raw.customer?.name ?? raw.Customer?.Name ?? '',
    netOfTotalOrderAmount: safeNet,
    returnsTotal: nReturns,
    status: raw.status ?? raw.Status,
    paymentType: raw.paymentType ?? raw.PaymentType,
    paymentStatus: raw.paymentStatus ?? raw.PaymentStatus,
    amountPaid: readNumber(raw, 'amountPaid', 'AmountPaid'),
    amountOutstanding: readNumber(raw, 'amountOutstanding', 'AmountOutstanding'),
    amountDue: nDue,
    payments: raw.payments ?? raw.Payments ?? [],
    orderDate: raw.createdAt ?? raw.CreatedAt ?? '',
    items,
    returnItems: mapReturnItems(rawReturnItems),
    allocationId: raw.allocationId ?? raw.AllocationId ?? undefined,
    returnId: raw.returnId ?? raw.ReturnId ?? undefined,
    invoiceId: raw.invoiceId ?? raw.InvoiceId ?? undefined,
    orderAllocated: raw.orderAllocated ?? raw.OrderAllocated ?? false
  };
}

export function draftItemsToLineItems(items: UiOrderItem[]): CreateOrderLineItemRequest[] {
  return items.map((i) => ({
    ProductId: i.productId,
    Quantity: i.quantity,
    Price: i.price
  }));
}
