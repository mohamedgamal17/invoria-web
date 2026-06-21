import { OrderStatus } from './order.entity';
import { canReturnOrderItems } from './order-return-items';

type OrderLike = {
  status: OrderStatus;
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
    label: 'Accept',
    icon: 'pi pi-check',
    severity: 'info',
    routeSegment: 'accept'
  },
  requestRevision: {
    label: 'Request revision',
    icon: 'pi pi-pencil',
    severity: 'warn',
    routeSegment: 'request-revision'
  },
  complete: {
    label: 'Complete',
    icon: 'pi pi-check-circle',
    severity: 'success',
    routeSegment: 'complete'
  },
  cancel: {
    label: 'Cancel',
    icon: 'pi pi-times',
    severity: 'danger',
    routeSegment: 'cancel'
  },
  returnItems: {
    label: 'Record return items',
    icon: 'pi pi-undo',
    severity: 'info',
    routeSegment: 'return-items'
  }
};

export function canEditOrder(order: OrderLike): boolean {
  return order.status === OrderStatus.Pending;
}

export function canAccept(order: OrderLike): boolean {
  return order.status === OrderStatus.Pending;
}

export function canRequestRevision(order: OrderLike): boolean {
  return order.status === OrderStatus.Processing;
}

export function canComplete(order: OrderLike): boolean {
  return order.status === OrderStatus.Processing || order.status === OrderStatus.Revision;
}

export function canCancel(order: OrderLike): boolean {
  return order.status === OrderStatus.Pending
    || order.status === OrderStatus.Processing
    || order.status === OrderStatus.Revision;
}

export { canReturnOrderItems };

export function getPrimaryOrderAction(order: OrderLike): OrderActionKey | null {
  if (canAccept(order)) return 'accept';
  if (canRequestRevision(order)) return 'requestRevision';
  if (canComplete(order)) return 'complete';
  if (canCancel(order)) return 'cancel';
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

export function orderStatusUserLabel(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.Pending:
      return 'Awaiting processing';
    case OrderStatus.Processing:
      return 'Processing order';
    case OrderStatus.Revision:
      return 'Revision requested';
    case OrderStatus.Completed:
      return 'Completed';
    case OrderStatus.Cancelled:
      return 'Cancelled';
    case OrderStatus.RevisionPending:
      return 'Revision pending';
    default:
      return 'Unknown';
  }
}

