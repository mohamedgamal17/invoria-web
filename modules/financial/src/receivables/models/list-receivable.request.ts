import type { PagingQueryRequest } from '@invoria/utils';

export interface ListReceivableRequest extends PagingQueryRequest {
  partyId?: string | null;
  sourceId?: string | null;
  isPaid?: boolean | null;
}
