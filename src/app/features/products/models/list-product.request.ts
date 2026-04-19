import type { PagingQueryRequest } from '../../../shared/requests/paging-query.request';

/**
 * Query for GET /products?Skip&Length&Name (optional name filter).
 */
export interface ListProductRequest extends PagingQueryRequest {
  /** Server-side case-insensitive substring match on product name (Catalog API). */
  Name?: string;
}

/** Default paging for product autocomplete on the orders dialog (first server page). */
export const productSearchListRequest: ListProductRequest = {
  Skip: 0,
  Length: 20
};
