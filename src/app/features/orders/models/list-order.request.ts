import type { PagingQueryRequest } from '../../../shared/requests/paging-query.request';

/**
 * Query for GET /orders (Swagger).
 */
export interface ListOrderRequest extends PagingQueryRequest {
  OrderNumber?: string | null;
  IncludeOrderItems: boolean;
}
