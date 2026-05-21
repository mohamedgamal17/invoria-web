import { OrderFullfillmentStatus, OrderStatus } from './order.entity';
import { canReturnOrderItems } from './order-return-items';

type OrderLike = {
  status: OrderStatus;
  fullfillmentStatus: OrderFullfillmentStatus;
};

export type OrderActionKey =
  | 'accept'
  | 'dispatch'
  | 'ship'
  | 'complete'
  | 'cancel'
  | 'reopen'
  | 'refuse'
  | 'returnItems'
  | 'edit';

export type OrderActionUiMeta = {
  label: string;
  icon: string;
  severity: 'success' | 'secondary' | 'info' | 'warn' | 'danger';
  routeSegment: string;
  requiresReason?: boolean;
};

export const ORDER_ACTION_UI: Record<Exclude<OrderActionKey, 'edit'>, OrderActionUiMeta> = {
  accept: {
    label: 'Accept',
    icon: 'pi pi-check',
    severity: 'success',
    routeSegment: 'accept'
  },
  dispatch: {
    label: 'Dispatch',
    icon: 'pi pi-truck',
    severity: 'info',
    routeSegment: 'dispatch'
  },
  ship: {
    label: 'Ship',
    icon: 'pi pi-send',
    severity: 'info',
    routeSegment: 'ship'
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
    routeSegment: 'cancel',
    requiresReason: true
  },
  reopen: {
    label: 'Reopen',
    icon: 'pi pi-refresh',
    severity: 'warn',
    routeSegment: 'reopen'
  },
  refuse: {
    label: 'Refuse',
    icon: 'pi pi-ban',
    severity: 'danger',
    routeSegment: 'refuse',
    requiresReason: true
  },
  returnItems: {
    label: 'Return items',
    icon: 'pi pi-replay',
    severity: 'warn',
    routeSegment: 'return-items'
  }
};

export function canEditOrder(order: OrderLike): boolean {
  // Keep existing UX intent: only editable when still not accepted.
  return order.status === OrderStatus.Pending || order.status === OrderStatus.Reopened;
}

export function canAccept(order: OrderLike): boolean {
  return order.status === OrderStatus.Pending || order.status === OrderStatus.Reopened;
}

export function canCancel(order: OrderLike): boolean {
  return order.status === OrderStatus.Pending || order.status === OrderStatus.Reopened;
}

export function canDispatch(order: OrderLike): boolean {
  // Rule from user: dispatch only after accepted+fulfilled (Allocated).
  return (
    order.status === OrderStatus.Accepted &&
    order.fullfillmentStatus === OrderFullfillmentStatus.Allocated
  );
}

export function canReopen(order: OrderLike): boolean {
  // Base transition: ACCEPTED -> REOPENED.
  // Block rule: if dispatched then cannot reopen again.
  if (order.fullfillmentStatus === OrderFullfillmentStatus.Dispatched) return false;
  return order.status === OrderStatus.Accepted;
}

export function canShip(order: OrderLike): boolean {
  return (
    order.status === OrderStatus.Accepted &&
    order.fullfillmentStatus === OrderFullfillmentStatus.Dispatched
  );
}

export function canComplete(order: OrderLike): boolean {
  return (
    order.status === OrderStatus.Shipped &&
    order.fullfillmentStatus === OrderFullfillmentStatus.Dispatched
  );
}

export function canRefuse(order: OrderLike): boolean {
  // Refuse is done because customer refused to receive the order.
  // Allow after accepted and after dispatch.
  return order.status === OrderStatus.Accepted;
}

export { canReturnOrderItems };

export function friendlyFullfillmentStatusLabel(status: OrderFullfillmentStatus): string {
  switch (status) {
    case OrderFullfillmentStatus.Pending:
      return 'Waiting allocation';
    case OrderFullfillmentStatus.Allocating:
      return 'Allocating stock';
    case OrderFullfillmentStatus.Allocated:
      return 'Ready to dispatch';
    case OrderFullfillmentStatus.OnHold:
      return 'On hold';
    case OrderFullfillmentStatus.Releasing:
      return 'Releasing stock';
    case OrderFullfillmentStatus.Dispatched:
      return 'Out for delivery';
    case OrderFullfillmentStatus.Cancelled:
      return 'Fulfillment cancelled';
    default:
      return 'Unknown';
  }
}

export function getPrimaryOrderAction(order: OrderLike): OrderActionKey | null {
  if (canDispatch(order)) return 'dispatch';
  if (canShip(order)) return 'ship';
  if (canComplete(order)) return 'complete';

  if (canAccept(order)) return 'accept';
  if (canReopen(order)) return 'reopen';
  if (canCancel(order)) return 'cancel';
  if (canRefuse(order)) return 'refuse';

  return null;
}

export function getAvailableOrderActions(order: OrderLike): OrderActionKey[] {
  const actions: OrderActionKey[] = [];
  if (canAccept(order)) actions.push('accept');
  if (canDispatch(order)) actions.push('dispatch');
  if (canShip(order)) actions.push('ship');
  if (canComplete(order)) actions.push('complete');
  if (canCancel(order)) actions.push('cancel');
  if (canReopen(order)) actions.push('reopen');
  if (canRefuse(order)) actions.push('refuse');
  if (canEditOrder(order)) actions.push('edit');
  return actions;
}

export function orderStatusLabel(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.Pending:
      return 'PENDING';
    case OrderStatus.Accepted:
      return 'ACCEPTED';
    case OrderStatus.Shipped:
      return 'SHIPPED';
    case OrderStatus.Completed:
      return 'COMPLETED';
    case OrderStatus.Cancelled:
      return 'CANCELLED';
    case OrderStatus.Reopened:
      return 'REOPENED';
    case OrderStatus.Refused:
      return 'REFUSED';
    default:
      return 'UNKNOWN';
  }
}

/** Short labels for end users (e.g. mobile cards); desktop tables still use `orderStatusLabel`. */
export function orderStatusUserLabel(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.Pending:
      return 'Awaiting confirmation';
    case OrderStatus.Accepted:
      return 'Confirmed';
    case OrderStatus.Shipped:
      return 'Shipped to customer';
    case OrderStatus.Completed:
      return 'Completed';
    case OrderStatus.Cancelled:
      return 'Cancelled';
    case OrderStatus.Reopened:
      return 'Reopened for changes';
    case OrderStatus.Refused:
      return 'Declined';
    default:
      return 'Unknown';
  }
}

export function orderFullfillmentStatusLabel(status: OrderFullfillmentStatus): string {
  switch (status) {
    case OrderFullfillmentStatus.Pending:
      return 'PENDING';
    case OrderFullfillmentStatus.Allocating:
      return 'ALLOCATING';
    case OrderFullfillmentStatus.Allocated:
      return 'ALLOCATED';
    case OrderFullfillmentStatus.OnHold:
      return 'ON_HOLD';
    case OrderFullfillmentStatus.Releasing:
      return 'RELEASING';
    case OrderFullfillmentStatus.Dispatched:
      return 'DISPATCHED';
    case OrderFullfillmentStatus.Cancelled:
      return 'CANCELLED';
    default:
      return 'UNKNOWN';
  }
}

