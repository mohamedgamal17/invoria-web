import type { CreateOrderLineItemRequest } from './create-order-line-item.request';
import type { Order, OrderFailureDetails, OrderItem, OrderStateTransitionHistory } from './order.entity';
import { friendlyFullfillmentStatusLabel, orderStatusLabel } from './order-actions';
import type { UiOrder, UiOrderFailureDetailRow, UiOrderItem, UiOrderStateHistoryEvent } from './order-ui.model';

function orderItemToUiItem(line: OrderItem): UiOrderItem {
  return {
    productId: line.productId,
    productName: line.product?.name?.trim() ? line.product.name : `Product ${line.productId}`,
    quantity: line.quantity,
    price: line.price
  };
}

function mapStateTransitionHistory(items: OrderStateTransitionHistory[] | undefined): UiOrderStateHistoryEvent[] {
  return (items ?? []).map((h) => {
    const to = orderStatusLabel(h.toStatus);
    const from = orderStatusLabel(h.fromStatus);
    const toFulfillment = friendlyFullfillmentStatusLabel(h.toFullfillmentStatus);

    return {
      from,
      to: `${to} · ${toFulfillment}`,
      timestamp: h.changedAt,
      reason: h.reason
    };
  });
}

function resolveFailureItemDisplayName(detail: OrderFailureDetails, orderItems: UiOrderItem[]): string {
  const apiProvided = detail.itemName?.trim();
  if (apiProvided) return apiProvided;

  const byProductId = orderItems.find((i) => i.productId === detail.itemId);
  if (byProductId?.productName?.trim()) return byProductId.productName;

  return `Item ${detail.itemId}`;
}

function mapFailureDetails(details: OrderFailureDetails[] | undefined, orderItems: UiOrderItem[]): UiOrderFailureDetailRow[] {
  return (details ?? []).map((d) => ({
    itemId: d.itemId,
    itemName: d.itemName,
    itemDisplayName: resolveFailureItemDisplayName(d, orderItems),
    quantityRequested: d.quantityRequested,
    quantityAvailable: d.quantityAvailable,
    shortage: d.shortage
  }));
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
    stateHistory: mapStateTransitionHistory(order.stateTransitionHistory),
    failureDetails: mapFailureDetails(order.failureDetails, items)
  };
}

export function draftItemsToLineItems(items: UiOrderItem[]): CreateOrderLineItemRequest[] {
  return items.map((i) => ({
    ProductId: i.productId,
    Quantity: i.quantity,
    Price: i.price
  }));
}
