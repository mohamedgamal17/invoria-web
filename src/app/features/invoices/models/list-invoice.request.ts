import type { PagingQueryRequest } from '../../../shared/requests/paging-query.request';

export interface ListInvoiceRequest extends PagingQueryRequest {
  CustomerId?: string | null;
  OrderId?: string | null;
}
