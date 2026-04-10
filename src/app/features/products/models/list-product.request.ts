import type { PagingQueryRequest } from '../../../shared/requests/paging-query.request';

/**
 * Query for GET /products?Skip&Length.
 */
export interface ListProductRequest extends PagingQueryRequest {}

/** Default paging for product name/code autocomplete (orders search). */
export const productSearchListRequest: ListProductRequest = {
  Skip: 0,
  Length: 500
};
