import { OrderStatus } from './order.entity';
import { canReturnOrderItems } from './order-return-items';

type OrderLike = {
  status: OrderStatus;
  orderAllocated: boolean;
};

export type OrderActionKey =
  | 'accept'
  | 'requestRevision'
  | 'complete'
  | 'cancel'
  | 'returnItems'
  | 'edit';

export type OrderActionUiMeta = {
  label: string;
  icon: string;
  severity: 'success' | 'secondary' | 'info' | 'warn' | 'danger';
  routeSegment: string;
};

export const ORDER_ACTION_UI: Record<Exclude<OrderActionKey, 'edit'>, OrderActionUiMeta> = {
  accept: {
    label: 'Confirm Order',
    icon: 'pi pi-check',
    severity: 'info',
    routeSegment: 'accept'
  },
  requestRevision: {
    label: 'Request Changes',
    icon: 'pi pi-pencil',
    severity: 'warn',
    routeSegment: 'request-revision'
  },
  complete: {
    label: 'Complete Order',
    icon: 'pi pi-check-circle',
    severity: 'success',
    routeSegment: 'complete'
  },
  cancel: {
    label: 'Cancel Order',
    icon: 'pi pi-times',
    severity: 'danger',
    routeSegment: 'cancel'
  },
  returnItems: {
    label: 'Return Items',
    icon: 'pi pi-undo',
    severity: 'info',
    routeSegment: 'return-items'
  }
};

export function canEditOrder(order: OrderLike): boolean {
  return order.status === OrderStatus.Pending || order.status === OrderStatus.Revision;
}

export function canAccept(order: OrderLike): boolean {
  return order.status === OrderStatus.Pending || order.status === OrderStatus.Revision;
}

export function canRequestRevision(order: OrderLike): boolean {
  return order.status === OrderStatus.Processing && order.orderAllocated;
}

export function canComplete(order: OrderLike): boolean {
  return (order.status === OrderStatus.Processing || order.status === OrderStatus.Revision)
    && order.orderAllocated;
}

export function canCancel(order: OrderLike): boolean {
  return order.status === OrderStatus.Pending
    || order.status === OrderStatus.Processing
    || order.status === OrderStatus.Revision;
}

export { canReturnOrderItems };

export function getPrimaryOrderAction(order: OrderLike): OrderActionKey | null {
  if (canComplete(order)) return 'complete';
  if (canAccept(order)) return 'accept';
  if (canRequestRevision(order)) return 'requestRevision';
  if (canCancel(order)) return 'cancel';
  return null;
}

export function getBeatingAction(order: OrderLike): OrderActionKey | null {
  if (canComplete(order)) return 'complete';
  if (canAccept(order)) return 'accept';
  if (canRequestRevision(order)) return 'requestRevision';
  return null;
}

export function getAvailableOrderActions(order: OrderLike): OrderActionKey[] {
  const actions: OrderActionKey[] = [];
  if (canAccept(order)) actions.push('accept');
  if (canRequestRevision(order)) actions.push('requestRevision');
  if (canComplete(order)) actions.push('complete');
  if (canCancel(order)) actions.push('cancel');
  if (canEditOrder(order)) actions.push('edit');
  if (canReturnOrderItems(order)) actions.push('returnItems');
  return actions;
}

export function orderStatusLabel(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.Pending:
      return 'PENDING';
    case OrderStatus.Processing:
      return 'PROCESSING';
    case OrderStatus.Revision:
      return 'REVISION';
    case OrderStatus.Completed:
      return 'COMPLETED';
    case OrderStatus.Cancelled:
      return 'CANCELLED';
    case OrderStatus.RevisionPending:
      return 'REVISION_PENDING';
    default:
      return 'UNKNOWN';
  }
}

export function orderStatusEmoji(status: OrderStatus): string {
  return '';
}

export function orderStatusUserLabel(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.Pending:
      return 'Awaiting confirmation';
    case OrderStatus.Processing:
      return 'Order in progress';
    case OrderStatus.Revision:
      return 'Revision requested';
    case OrderStatus.Completed:
      return 'Delivered & complete';
    case OrderStatus.Cancelled:
      return 'Cancelled';
    case OrderStatus.RevisionPending:
      return 'Revision pending';
    default:
      return 'Unknown';
  }
}

export function orderStatusSeverity(
  status: OrderStatus
): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
  switch (status) {
    case OrderStatus.Completed:
      return 'success';
    case OrderStatus.Processing:
      return 'info';
    case OrderStatus.Revision:
    case OrderStatus.RevisionPending:
      return 'warn';
    case OrderStatus.Cancelled:
      return 'danger';
    default:
      return 'secondary';
  }
}

