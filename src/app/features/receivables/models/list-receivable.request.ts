import type { PagingQueryRequest } from '../../../shared/requests/paging-query.request';

export interface ListReceivableRequest extends PagingQueryRequest {
  PartyId?: string | null;
  SourceId?: string | null;
  IsPaid?: boolean | null;
}
