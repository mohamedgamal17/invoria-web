import type { PagingQueryRequest } from '../../../shared/requests/paging-query.request';

/**
 * Query for GET /purchase-orders (Swagger).
 */
export interface ListPurchaseOrderRequest extends PagingQueryRequest {
  Number?: string | null;
  IncludePurchaseItems: boolean;
  IncludeSupplier: boolean;
}
