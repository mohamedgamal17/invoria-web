import type {
  OrderPayment,
  OrderStatus
} from './order.entity';
import type { PaymentStatus, PaymentType } from './order-payment.enums';

/** Recorded return line for order details UI. */
export interface UiReturnItem {
  orderItemId: string;
  productName: string;
  quantity: number;
  orderedQuantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface UiOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface UiOrderStateHistoryEvent {
  from?: string;
  to: string;
  timestamp: string;
  reason?: string | null;
}

export interface UiOrderFailureDetailRow {
  itemId: string;
  itemName?: string | null;
  itemDisplayName: string;
  quantityRequested: number;
  quantityAvailable: number;
  shortage: number;
}

export interface UiOrder {
  id: string;
  createdAt: string;
  createdBy?: string;
  lastModifiedAt?: string;
  lastModifiedBy?: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  totalAmount: number;
  status: OrderStatus;
  paymentType?: PaymentType;
  paymentStatus?: PaymentStatus;
  amountPaid?: number;
  amountOutstanding?: number;
  payments?: OrderPayment[];
  orderDate: string;
  items: UiOrderItem[];
  returnItems: UiReturnItem[];
  stateHistory: UiOrderStateHistoryEvent[];
  failureDetails: UiOrderFailureDetailRow[];
}

export type OrderCreateInput = Pick<
  UiOrder,
  'orderNumber' | 'customerName' | 'totalAmount' | 'orderDate' | 'items'
>;
export type OrderUpdateInput = Partial<Pick<UiOrder, 'orderNumber' | 'customerName' | 'totalAmount' | 'items'>>;
