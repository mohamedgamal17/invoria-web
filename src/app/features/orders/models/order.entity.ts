import { Entity } from '../../../core/models/entity';
import type { Customer } from '../../customers/models/customer.entity';
import type { Product } from '../../products/models/product.entity';

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  product?: Product | null;
}

export interface Order extends Entity {
  orderNumber: string;
  customerId: string;
  customer?: Customer | null;
  items: OrderItem[];
}
