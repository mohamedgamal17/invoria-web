import type { PagingQueryRequest } from '@invoria/utils';

/**
 * Query for GET /customers?skip&length&name (optional name filter per API).
 */
export interface ListCustomerRequest extends PagingQueryRequest {
  name?: string | null;
}

/** Default paging for customer autocomplete on the orders dialog (first server page). */
export const customerSearchListRequest: ListCustomerRequest = {
  skip: 0,
  length: 20
};
