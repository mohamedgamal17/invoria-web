/**
 * Line item body for POST /orders and PUT /orders/{id} (Swagger).
 */
export interface CreateOrderLineItemRequest {
  ProductId: string;
  Quantity: number;
  Price: number;
}
