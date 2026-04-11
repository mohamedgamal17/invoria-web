import { Entity } from '../../../core/models/entity';
import type { Customer } from '../../customers/models/customer.entity';
import type { Product } from '../../products/models/product.entity';

/** `InvoriaOrderingContractsOrdersOrderStatus` (Swagger: integer enum). */
export enum OrderStatus {
  Pending = 5,
  Accepted = 10,
  Completed = 15,
  Cancelled = 20,
  Reopened = 25,
  Refused = 30
}

/** `InvoriaOrderingContractsOrdersFullfillmentStatus` (Swagger spelling). */
export enum OrderFullfillmentStatus {
  Pending = 5,
  Allocating = 10,
  Allocated = 15,
  OnHold = 20,
  Releasing = 25,
  Dispatched = 30,
  Cancelled = 35
}

/** `InvoriaOrderingContractsDtosOrderItemDto` (GET/POST order responses). */
export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  product?: Product | null;
}

/** `InvoriaOrderingContractsDtosOrderDto` (Swagger-aligned; JSON uses camelCase). */
export interface Order extends Entity {
  orderNumber: string;
  customerId: string;
  customer?: Customer | null;
  status: OrderStatus;
  /** API contract spelling (`FullfillmentStatus` in OpenAPI). */
  fullfillmentStatus: OrderFullfillmentStatus;
  /** Omitted or empty when list is fetched with `IncludeOrderItems: false`. */
  items?: OrderItem[];
}
