import type { PagingQueryRequest } from '../../../shared/requests/paging-query.request';

/**
 * Query for GET /customers?Skip&Length&Name (optional name filter per API).
 */
export interface ListCustomerRequest extends PagingQueryRequest {
  Name?: string | null;
}

/** Default paging for customer autocomplete on the orders dialog (first server page). */
export const customerSearchListRequest: ListCustomerRequest = {
  Skip: 0,
  Length: 20
};
