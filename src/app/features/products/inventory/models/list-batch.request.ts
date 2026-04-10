import type { PagingQueryRequest } from '../../../../shared/requests/paging-query.request';

/**
 * Query for GET /batches?ProductId&Skip&Length.
 */
export interface ListBatchRequest extends PagingQueryRequest {
  ProductId: string;
}
