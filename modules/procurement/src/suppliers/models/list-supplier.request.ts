import type { PagingQueryRequest } from '@invoria/utils';

/** Query for GET /suppliers?skip&length&name (optional name filter). */
export interface ListSupplierRequest extends PagingQueryRequest {
  /** Server-side case-insensitive substring match on supplier name. */
  name?: string | null;
}

/** Default paging for supplier autocomplete. */
export const supplierSearchListRequest: ListSupplierRequest = {
  skip: 0,
  length: 50
};
