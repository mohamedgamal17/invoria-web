import type { PagingQueryRequest } from '../../../shared/requests/paging-query.request';

/** Query for GET /suppliers (Swagger-style paging). */
export interface ListSupplierRequest extends PagingQueryRequest {
  Name?: string | null;
}

/** Default paging for supplier autocomplete. */
export const supplierSearchListRequest: ListSupplierRequest = {
  Skip: 0,
  Length: 50
};
