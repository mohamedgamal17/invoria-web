/**
 * Line item body for POST /purchase-orders (Swagger / FastEndpoints).
 */
export interface CreatePurchaseOrderLineItemRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
}

/**
 * Body for POST /purchase-orders (Swagger).
 */
export interface CreatePurchaseOrderRequest {
  supplierId: string;
  purchaseOrderItems: CreatePurchaseOrderLineItemRequest[];
}
