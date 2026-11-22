/**
 * Body for POST /batches (Swagger).
 */
export interface CreateBatchRequest {
  productId: string;
  quantity: number;
  purchasePrice: number;
}
