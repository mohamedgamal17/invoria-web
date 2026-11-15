import type { CreateOrderLineItemRequest } from './create-order-line-item.request';
import type { Order, OrderItem } from './order.entity';
import type { UiOrder } from './order-ui.model';

export function orderToUiOrder(order: Order): UiOrder {
  return {
    id: order.id,
    createdAt: order.createdAt,
    createdBy: order.createdBy,
    lastModifiedAt: order.lastModifiedAt,
    lastModifiedBy: order.lastModifiedBy,
    orderNumber: order.orderNumber,
    customerId: order.customerId,
    customerName: order.customer?.name ?? '',
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
    items: order.items,
    returnItems: order.returnItems,
    allocationId: order.allocationId ?? undefined,
    returnId: order.returnId ?? undefined,
    invoiceId: order.invoiceId ?? undefined,
    orderAllocated: order.orderAllocated
  };
}

export function draftItemsToLineItems(items: OrderItem[]): CreateOrderLineItemRequest[] {
  return items.map((item) => ({
    ProductId: item.productId,
    Quantity: item.quantity,
    Price: item.price
  }));
}
