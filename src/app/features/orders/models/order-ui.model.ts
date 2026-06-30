import type {
  OrderPayment,
  OrderStatus
} from './order.entity';
import type { PaymentStatus, PaymentType } from './order-payment.enums';

export interface UiReturnItem {
  orderItemId: string;
  productName: string;
  productId: string;
  quantity: number;
  orderedQuantity: number;
  unitPrice: number;
  lineReturnTotal: number;
}

export interface UiOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
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
  netOfTotalOrderAmount: number;
  returnsTotal: number;
  status: OrderStatus;
  paymentType?: PaymentType;
  paymentStatus?: PaymentStatus;
  amountPaid?: number;
  amountOutstanding?: number;
  payments?: OrderPayment[];
  orderDate: string;
  items: UiOrderItem[];
  returnItems: UiReturnItem[];
  allocationId?: string;
  returnId?: string;
  invoiceId?: string;
  orderAllocated: boolean;
}

export type OrderCreateInput = Pick<
  UiOrder,
  'orderNumber' | 'customerName' | 'totalAmount' | 'orderDate' | 'items'
>;
export type OrderUpdateInput = Partial<Pick<UiOrder, 'orderNumber' | 'customerName' | 'totalAmount' | 'items'>>;
