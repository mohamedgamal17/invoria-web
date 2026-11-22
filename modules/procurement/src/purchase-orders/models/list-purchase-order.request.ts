import type { PagingQueryRequest } from '@invoria/utils';

/**
 * Query for GET /purchase-orders (Swagger).
 */
export interface ListPurchaseOrderRequest extends PagingQueryRequest {
  number?: string | null;
  /** Lifecycle filter (`PurchaseState`); GET /purchase-orders `status` query. */
  status?: number | null;
  /** When set, restricts results to this supplier (GET /purchase-orders query). */
  supplierId?: string | null;
  includePurchaseItems: boolean;
  includeSupplier: boolean;
}
