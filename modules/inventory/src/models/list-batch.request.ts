import type { PagingQueryRequest } from '@invoria/utils';

/**
 * Query for GET /batches?productId&skip&length.
 */
export interface ListBatchRequest extends PagingQueryRequest {
  productId: string;
}
