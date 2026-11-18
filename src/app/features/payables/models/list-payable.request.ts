import type { PagingQueryRequest } from '../../../shared/requests/paging-query.request';

export interface ListPayableRequest extends PagingQueryRequest {
  /** Optional party (supplier) reference to filter by. */
  partyId?: string | null;
  /** Optional source (purchase order) reference to filter by. */
  sourceId?: string | null;
  isPaid?: boolean | null;
}
