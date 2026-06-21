import { Entity } from '../../../core/models/entity';
import type { Customer } from '../../customers/models/customer.entity';
import type { Product } from '../../products/models/product.entity';
import type { OrderPaymentMethod, PaymentStatus, PaymentType } from './order-payment.enums';

export enum OrderStatus {
  Pending = 5,
  Processing = 10,
  Revision = 15,
  Completed = 20,
  Cancelled = 25,
  RevisionPending = 30
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product | null;
}

export interface OrderFailureDetails extends Entity {
  itemId: string;
  itemName?: string | null;
  quantityRequested: number;
  quantityAvailable: number;
  shortage: number;
}

export interface OrderStateTransitionHistory {
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  changedAt: string;
  reason?: string | null;
}

export interface OrderPayment extends Entity {
  orderId: string;
  paidAmount: number;
  paymentMethod: OrderPaymentMethod;
  paidAt: string;
}

export interface Order extends Entity {
  orderNumber: string;
  customerId: string;
  customer?: Customer | null;
  status: OrderStatus;
  paymentType?: PaymentType;
  paymentStatus?: PaymentStatus;
  amountPaid?: number;
  amountOutstanding?: number;
  items?: OrderItem[];
  failureDetails?: OrderFailureDetails[];
  stateTransitionHistory?: OrderStateTransitionHistory[];
  payments?: OrderPayment[];
}
