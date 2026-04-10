/**
 * Product fields required by batch UI. Keeps the inventory feature independent of `products/models/product.entity`.
 */
export interface BatchesProductRef {
  id: string;
  name: string;
  code?: string;
}
