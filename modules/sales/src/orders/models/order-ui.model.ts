import type {
  OrderItem,
  OrderPayment,
  OrderReturnItem,
  OrderStatus
} from './order.entity';
import type { PaymentStatus, PaymentType } from './order-payment.enums';

export interface UiOrder {
  id: string;
  createdAt: string;
  createdBy?: string;
  lastModifiedAt?: string;
  lastModifiedBy?: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  netOfTotalOrderAmount: number;
  returnsTotal: number;
  amountDue?: number;
  status: OrderStatus;
  paymentType?: PaymentType;
  paymentStatus?: PaymentStatus;
  amountPaid?: number;
  amountOutstanding?: number;
  payments?: OrderPayment[];
  orderDate: string;
  items: OrderItem[];
  returnItems: OrderReturnItem[];
  allocationId?: string;
  returnId?: string;
  invoiceId?: string;
  orderAllocated: boolean;
}
