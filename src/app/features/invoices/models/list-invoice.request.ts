import type { PagingQueryRequest } from '../../../shared/requests/paging-query.request';

export interface ListInvoiceRequest extends PagingQueryRequest {
  customerId?: string | null;
  orderId?: string | null;
}
