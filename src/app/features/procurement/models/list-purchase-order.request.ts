import type { PagingQueryRequest } from '../../../shared/requests/paging-query.request';

/**
 * Query for GET /purchase-orders (Swagger).
 */
export interface ListPurchaseOrderRequest extends PagingQueryRequest {
  Number?: string | null;
  /** When set, restricts results to this supplier (GET /purchase-orders query). */
  SupplierId?: string | null;
  IncludePurchaseItems: boolean;
  IncludeSupplier: boolean;
}
