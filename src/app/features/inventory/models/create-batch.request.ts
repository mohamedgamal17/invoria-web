/**
 * Body for POST /batches (Swagger).
 */
export interface CreateBatchRequest {
  ProductId: string;
  Quantity: number;
  PurchasePrice: number;
}
