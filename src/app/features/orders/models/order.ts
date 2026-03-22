import { AuditedEntity } from '../../../shared/entities/base-entity';

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export type Order = AuditedEntity<{
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: OrderStatus;
  orderDate: string;
}>;

export type OrderCreateInput = Pick<Order, 'orderNumber' | 'customerName' | 'totalAmount' | 'status' | 'orderDate'>;
export type OrderUpdateInput = Partial<OrderCreateInput>;
