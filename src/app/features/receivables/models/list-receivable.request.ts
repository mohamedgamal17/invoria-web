import type { PagingQueryRequest } from '../../../shared/requests/paging-query.request';

export interface ListReceivableRequest extends PagingQueryRequest {
  partyId?: string | null;
  sourceId?: string | null;
  isPaid?: boolean | null;
}
