import type { PagingQueryRequest } from '@invoria/utils';

export interface ListInvoiceRequest extends PagingQueryRequest {
  customerId?: string | null;
  orderId?: string | null;
}
