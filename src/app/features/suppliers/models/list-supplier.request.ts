import type { PagingQueryRequest } from '../../../shared/requests/paging-query.request';

/** Query for GET /suppliers?Skip&Length&Name (optional name filter). */
export interface ListSupplierRequest extends PagingQueryRequest {
  /** Server-side case-insensitive substring match on supplier name. */
  Name?: string | null;
}

/** Default paging for supplier autocomplete. */
export const supplierSearchListRequest: ListSupplierRequest = {
  Skip: 0,
  Length: 50
};
