import type { PagingQueryRequest } from '../../../shared/requests/paging-query.request';

/**
 * Query for GET /orders (Swagger).
 */
export interface ListOrderRequest extends PagingQueryRequest {
  OrderNumber?: string | null;
  /** When set, restricts results to this customer (GET /orders query). */
  CustomerId?: string | null;
  IncludeOrderItems: boolean;
}
