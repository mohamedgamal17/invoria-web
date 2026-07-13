import type { CreateOrderLineItemRequest } from './create-order-line-item.request';
import type { Order, OrderItem, OrderReturnItem } from './order.entity';
import type { UiOrder, UiOrderItem, UiReturnItem } from './order-ui.model';

function orderItemToUiItem(line: OrderItem): UiOrderItem {
  return {
    id: line.id ?? '',
    productId: line.productId,
    productName: line.product?.name?.trim() || line.productId,
    quantity: line.quantity,
    price: line.price
  };
}

function mapReturnItems(items: OrderReturnItem[]): UiReturnItem[] {
  return items.map((r) => ({
    orderItemId: r.orderItemId,
    productName: r.product?.name?.trim() || r.productId,
    productId: r.productId,
    quantity: r.quantity,
    orderedQuantity: r.orderedQuantity,
    unitPrice: r.unitPrice,
    lineReturnTotal: r.lineReturnTotal
  }));
}

export function orderToUiOrder(order: Order): UiOrder {
  const items = order.items.map(orderItemToUiItem);

  return {
    id: order.id,
    createdAt: order.createdAt,
    createdBy: order.createdBy,
    lastModifiedAt: order.lastModifiedAt,
    lastModifiedBy: order.lastModifiedBy,
    orderNumber: order.orderNumber,
    customerId: order.customerId,
    customerName: order.customer?.name ?? '',
    totalAmount: order.subtotalAmount,
    netOfTotalOrderAmount: order.netOrderAmount,
    returnsTotal: order.returnsAmount,
    status: order.status,
    paymentType: order.paymentType,
    paymentStatus: order.paymentStatus,
    amountPaid: order.amountPaid,
    amountOutstanding: order.amountOutstanding,
    amountDue: order.amountDue,
    payments: order.payments,
    orderDate: order.createdAt,
    items,
    returnItems: mapReturnItems(order.returnItems),
    allocationId: order.allocationId ?? undefined,
    returnId: order.returnId ?? undefined,
    invoiceId: order.invoiceId ?? undefined,
    orderAllocated: order.orderAllocated
  };
}

export function draftItemsToLineItems(items: UiOrderItem[]): CreateOrderLineItemRequest[] {
  return items.map((i) => ({
    ProductId: i.productId,
    Quantity: i.quantity,
    Price: i.price
  }));
}
