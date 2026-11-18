/**
 * Body for PUT /orders/{id}/return-items (Swagger / FastEndpoints).
 */
export interface AddReturnLineItemRequest {
  orderItemId: string;
  quantity: number;
}

export interface AddReturnItemsRequest {
  items: AddReturnLineItemRequest[];
}
