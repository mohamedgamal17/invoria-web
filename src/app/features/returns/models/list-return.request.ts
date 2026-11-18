import type { PagingQueryRequest } from '../../../shared/requests/paging-query.request';

export interface ListReturnRequest extends PagingQueryRequest {
  type?: number | null;
}
