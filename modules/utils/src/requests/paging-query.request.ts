/**
 * Shared query shape for API paging (`skip`, `length`; the wire is camelCase even though Swagger lists PascalCase).
 * Extend in feature-specific list requests (e.g. {@link ListCustomerRequest}).
 */
export interface PagingQueryRequest {
  skip: number;
  length: number;
}
