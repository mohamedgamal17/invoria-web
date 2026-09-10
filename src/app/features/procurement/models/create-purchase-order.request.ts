/**
 * Line item body for POST /purchase-orders (Swagger / FastEndpoints).
 */
export interface CreatePurchaseOrderLineItemRequest {
  ProductId: string;
  Quantity: number;
  UnitPrice: number;
}

/**
 * Body for POST /purchase-orders (Swagger).
 */
export interface CreatePurchaseOrderRequest {
  SupplierId: string;
  PurchaseOrderItems: CreatePurchaseOrderLineItemRequest[];
}
