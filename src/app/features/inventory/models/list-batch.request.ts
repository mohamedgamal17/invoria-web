import type { PagingQueryRequest } from '../../../shared/requests/paging-query.request';

/**
 * Query for GET /batches?productId&skip&length.
 */
export interface ListBatchRequest extends PagingQueryRequest {
  productId: string;
}
