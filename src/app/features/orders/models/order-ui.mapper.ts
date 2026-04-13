import type { CreateOrderLineItemRequest } from './create-order-line-item.request';
import type { Order, OrderItem } from './order.entity';
import type { UiOrder, UiOrderItem } from './order-ui.model';

function orderItemToUiItem(line: OrderItem): UiOrderItem {
  return {
    productId: line.productId,
    productName: line.product?.name?.trim() ? line.product.name : `Product ${line.productId}`,
    quantity: line.quantity,
    price: line.price
  };
}

export function orderToUiOrder(order: Order): UiOrder {
  const items = (order.items ?? []).map(orderItemToUiItem);
  const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return {
    id: order.id,
    createdAt: order.createdAt,
    createdBy: order.createdBy,
    lastModifiedAt: order.lastModifiedAt,
    lastModifiedBy: order.lastModifiedBy,
    orderNumber: order.orderNumber,
    customerId: order.customerId,
    customerName: order.customer?.name ?? '',
    totalAmount,
    status: order.status,
    fullfillmentStatus: order.fullfillmentStatus,
    orderDate: order.createdAt,
    items,
    stateHistory: []
  };
}

export function draftItemsToLineItems(items: UiOrderItem[]): CreateOrderLineItemRequest[] {
  return items.map((i) => ({
    ProductId: i.productId,
    Quantity: i.quantity,
    Price: i.price
  }));
}
