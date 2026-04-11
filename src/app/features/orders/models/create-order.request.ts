import type { CreateOrderLineItemRequest } from './create-order-line-item.request';

/**
 * Body for POST /orders (Swagger).
 */
export interface CreateOrderRequest {
  CustomerId: string;
  Items: CreateOrderLineItemRequest[];
}
