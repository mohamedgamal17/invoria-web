import type { PagingQueryRequest } from '../../../shared/requests/paging-query.request';

/**
 * Query for GET /customers?Skip&Length.
 */
export interface ListCustomerRequest extends PagingQueryRequest {}

/** Default paging for customer name autocomplete (orders search). */
export const customerSearchListRequest: ListCustomerRequest = {
  Skip: 0,
  Length: 500
};
