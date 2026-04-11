export type OrderState =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REOPENED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUSED';

export interface OrderStateTransition {
  from: OrderState;
  to: OrderState;
  timestamp: string;
  changedBy: string;
  reason?: string;
}

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
