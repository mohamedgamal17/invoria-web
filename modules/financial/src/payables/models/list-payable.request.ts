import type { PagingQueryRequest } from '@invoria/utils';

export interface ListPayableRequest extends PagingQueryRequest {
  /** Optional party (supplier) reference to filter by. */
  partyId?: string | null;
  /** Optional source (purchase order) reference to filter by. */
  sourceId?: string | null;
  isPaid?: boolean | null;
}
