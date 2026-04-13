import type { PagingQueryRequest } from '../../../shared/requests/paging-query.request';

/**
 * Query for GET /products?Skip&Length.
 */
export interface ListProductRequest extends PagingQueryRequest {}

/** Default paging for product autocomplete on the orders dialog (first server page). */
export const productSearchListRequest: ListProductRequest = {
  Skip: 0,
  Length: 20
};
