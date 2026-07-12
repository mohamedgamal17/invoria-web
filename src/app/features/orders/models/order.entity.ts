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

export interface OrderReturnItem {
  orderItemId: string;
  quantity: number;
  productId: string;
  orderedQuantity: number;
  unitPrice: number;
  lineReturnTotal: number;
  product?: Product | null;
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
  paymentType: PaymentType;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  amountOutstanding: number;
  items: OrderItem[];
  returnItems: OrderReturnItem[];
  subtotalAmount: number;
  netOrderAmount: number;
  returnsAmount: number;
  amountDue: number;
  payments: OrderPayment[];
  allocationId?: string | null;
  returnId?: string | null;
  invoiceId?: string | null;
  orderAllocated: boolean;
}
