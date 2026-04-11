import type { CreateOrderLineItemRequest } from './create-order-line-item.request';

/**
 * Body for PUT /orders/{id} (Swagger).
 */
export interface UpdateOrderItemsRequest {
  Items: CreateOrderLineItemRequest[];
}
