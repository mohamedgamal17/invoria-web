import { AuditedEntity } from '../../../shared/entities/base-entity';

export type OrderState = 'PENDING' | 'ACCEPTED' | 'REOPENED' | 'COMPLETED' | 'CANCELLED' | 'REFUSED';

export interface OrderStateTransition {
  from: OrderState;
  to: OrderState;
  timestamp: string;
  changedBy: string;
  reason?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export type Order = AuditedEntity<{
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: OrderState;
  orderDate: string;
  items: OrderItem[];
  stateHistory: OrderStateTransition[];
}>;

export type OrderCreateInput = Pick<Order, 'orderNumber' | 'customerName' | 'totalAmount' | 'orderDate' | 'items'>;
export type OrderUpdateInput = Partial<Pick<Order, 'orderNumber' | 'customerName' | 'totalAmount' | 'items'>>;

export const STATE_TRANSITIONS: Record<OrderState, OrderState[]> = {
  PENDING: ['ACCEPTED', 'CANCELLED'],
  ACCEPTED: ['REOPENED', 'COMPLETED', 'REFUSED'],
  REOPENED: ['ACCEPTED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  REFUSED: []
};

export const canTransition = (currentState: OrderState, targetState: OrderState): boolean => {
  return STATE_TRANSITIONS[currentState]?.includes(targetState) ?? false;
};

export const canEditOrder = (orderState: OrderState): boolean => {
  return ['PENDING', 'REOPENED'].includes(orderState);
};
