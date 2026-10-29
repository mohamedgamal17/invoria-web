import type { PagingQueryRequest } from '../../../shared/requests/paging-query.request';

export interface ListPayableRequest extends PagingQueryRequest {
  /** Optional party (supplier) reference to filter by. */
  PartyId?: string | null;
  /** Optional source (purchase order) reference to filter by. */
  SourceId?: string | null;
  IsPaid?: boolean | null;
}
