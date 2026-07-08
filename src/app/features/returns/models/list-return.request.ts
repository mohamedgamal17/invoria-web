import type { PagingQueryRequest } from '../../../shared/requests/paging-query.request';

export interface ListReturnRequest extends PagingQueryRequest {
  Type?: number | null;
}
