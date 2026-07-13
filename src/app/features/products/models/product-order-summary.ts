import type { UiOrder } from '../../orders/models/order-ui.model';
import type { OrderStatus } from '../../orders/models/order.entity';

/** Per-order financial view for a single product's lines and returns. */
export type ProductOrderRowSummary = {
  orderId: string;
  orderNumber: string;
  orderStatusLabel: string;
  orderStatus: OrderStatus;
  productLineSubtotal: number;
  productReturnSubtotal: number;
  productNetSubtotal: number;
  orderTotal: number;
  orderReturnSubtotal: number;
  orderNetAfterReturns: number;
};

/** Rolled-up totals across orders that include this product. */
export type ProductOrdersAggregateSummary = {
  orderCount: number;
  productLineSubtotalTotal: number;
  productReturnSubtotalTotal: number;
  productNetSubtotalTotal: number;
  orderTotalSum: number;
  orderReturnSubtotalSum: number;
  orderNetAfterReturnsSum: number;
};

export function orderIncludesProduct(order: UiOrder, productId: string): boolean {
  return order.items.some((line) => line.productId === productId);
}

export function productLineSubtotal(order: UiOrder, productId: string): number {
  return order.items
    .filter((line) => line.productId === productId)
    .reduce((sum, line) => sum + line.price * line.quantity, 0);
}

export function productReturnSubtotal(order: UiOrder, productId: string): number {
  const lineIds = new Set(
    order.items.filter((line) => line.productId === productId).map((line) => line.id)
  );
  return order.returnItems
    .filter((row) => lineIds.has(row.orderItemId))
    .reduce((sum, row) => sum + row.lineReturnTotal, 0);
}

export function orderReturnSubtotal(order: UiOrder): number {
  return order.returnItems.reduce((sum, row) => sum + row.lineReturnTotal, 0);
}

export function buildProductOrderRowSummary(
  order: UiOrder,
  productId: string,
  orderStatusLabel: string,
  orderStatus: OrderStatus
): ProductOrderRowSummary | null {
  if (!orderIncludesProduct(order, productId)) {
    return null;
  }

  const lineSubtotal = productLineSubtotal(order, productId);
  const returnSubtotal = productReturnSubtotal(order, productId);
  const orderReturns = orderReturnSubtotal(order);

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    orderStatusLabel,
    orderStatus,
    productLineSubtotal: lineSubtotal,
    productReturnSubtotal: returnSubtotal,
    productNetSubtotal: lineSubtotal - returnSubtotal,
    orderTotal: order.totalAmount,
    orderReturnSubtotal: orderReturns,
    orderNetAfterReturns: order.totalAmount - orderReturns
  };
}

export function buildProductOrdersAggregateSummary(
  rows: ProductOrderRowSummary[]
): ProductOrdersAggregateSummary {
  return rows.reduce<ProductOrdersAggregateSummary>(
    (acc, row) => ({
      orderCount: acc.orderCount + 1,
      productLineSubtotalTotal: acc.productLineSubtotalTotal + row.productLineSubtotal,
      productReturnSubtotalTotal: acc.productReturnSubtotalTotal + row.productReturnSubtotal,
      productNetSubtotalTotal: acc.productNetSubtotalTotal + row.productNetSubtotal,
      orderTotalSum: acc.orderTotalSum + row.orderTotal,
      orderReturnSubtotalSum: acc.orderReturnSubtotalSum + row.orderReturnSubtotal,
      orderNetAfterReturnsSum: acc.orderNetAfterReturnsSum + row.orderNetAfterReturns
    }),
    {
      orderCount: 0,
      productLineSubtotalTotal: 0,
      productReturnSubtotalTotal: 0,
      productNetSubtotalTotal: 0,
      orderTotalSum: 0,
      orderReturnSubtotalSum: 0,
      orderNetAfterReturnsSum: 0
    }
  );
}

export function summarizeProductOrders(
  orders: UiOrder[],
  productId: string,
  statusLabelFn: (order: UiOrder) => string
): { rows: ProductOrderRowSummary[]; aggregate: ProductOrdersAggregateSummary } {
  const rows = orders
    .map((order) => buildProductOrderRowSummary(order, productId, statusLabelFn(order), order.status))
    .filter((row): row is ProductOrderRowSummary => row !== null)
    .sort((a, b) => a.orderNumber.localeCompare(b.orderNumber));

  return {
    rows,
    aggregate: buildProductOrdersAggregateSummary(rows)
  };
}
