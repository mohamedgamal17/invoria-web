import type { PagingQueryRequest } from '@invoria/utils';

/**
 * Query for GET /products?skip&length&name (optional name filter).
 */
export interface ListProductRequest extends PagingQueryRequest {
  /** Server-side case-insensitive substring match on product name (Catalog API). */
  name?: string;
}

/** Default paging for product autocomplete on the orders dialog (first server page). */
export const productSearchListRequest: ListProductRequest = {
  skip: 0,
  length: 20
};
