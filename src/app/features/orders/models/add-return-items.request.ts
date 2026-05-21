/**
 * Body for PUT /orders/{id}/return-items (Swagger / FastEndpoints).
 */
export interface AddReturnLineItemRequest {
  OrderItemId: string;
  Quantity: number;
}

export interface AddReturnItemsRequest {
  Items: AddReturnLineItemRequest[];
}
