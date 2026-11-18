import type { PagingQueryRequest } from '../../../shared/requests/paging-query.request';

/**
 * Query for GET /orders (Swagger).
 */
export interface ListOrderRequest extends PagingQueryRequest {
  orderNumber?: string | null;
  /** When set, restricts results to this customer (GET /orders query). */
  customerId?: string | null;
  /** Order lifecycle status filter (`InvoriaOrderingContractsOrdersOrderStatus`). */
  status?: number | null;
  paymentStatus?: number | null;
  paymentType?: number | null;
  includeOrderItems: boolean;
}
