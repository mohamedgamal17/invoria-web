import type { OrderFullfillmentStatus } from './order.entity';
import type { OrderStatus } from './order.entity';

/** Mock/UI line item (includes display name not present on API contract). */
export interface UiOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

/** Mock/UI order row used until the orders page is wired to {@link Order}. */
export interface UiOrder {
  id: string;
  createdAt: string;
  createdBy?: string;
  lastModifiedAt?: string;
  lastModifiedBy?: string;
  orderNumber: string;
  /** Set when row comes from the API (`Order.customerId`). */
  customerId?: string;
  customerName: string;
  totalAmount: number;
  status: OrderStatus;
  fullfillmentStatus: OrderFullfillmentStatus;
  orderDate: string;
  items: UiOrderItem[];
  stateHistory: unknown[];
}

export type OrderCreateInput = Pick<
  UiOrder,
  'orderNumber' | 'customerName' | 'totalAmount' | 'orderDate' | 'items'
>;
export type OrderUpdateInput = Partial<Pick<UiOrder, 'orderNumber' | 'customerName' | 'totalAmount' | 'items'>>;
