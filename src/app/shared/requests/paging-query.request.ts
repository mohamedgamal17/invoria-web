/**
 * Shared query shape for API paging (`Skip`, `Length` per Swagger).
 * Extend in feature-specific list requests (e.g. {@link ListCustomerRequest}).
 */
export interface PagingQueryRequest {
  Skip: number;
  Length: number;
}
