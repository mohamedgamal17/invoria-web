/**
 * Line item body for POST /purchase-orders (Swagger / FastEndpoints).
 */
export interface CreatePurchaseOrderLineItemRequest {
  ProductId: string;
  Quantity: number;
  UnitPrice: number;
  SupplierProductCode?: string | null;
}

/**
 * Body for POST /purchase-orders (Swagger).
 */
export interface CreatePurchaseOrderRequest {
  SupplierId: string;
  TaxAmount: number;
  DiscountAmount: number;
  OrderDate?: string | null;
  ExpectedDeliveryDate?: string | null;
  PurchaseOrderItems: CreatePurchaseOrderLineItemRequest[];
}
