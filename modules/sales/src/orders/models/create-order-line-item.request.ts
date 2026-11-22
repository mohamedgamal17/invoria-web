/**
 * Line item body for POST /orders and PUT /orders/{id} (Swagger).
 */
export interface CreateOrderLineItemRequest {
  productId: string;
  quantity: number;
  price: number;
}
