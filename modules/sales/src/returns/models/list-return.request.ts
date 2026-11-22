import type { PagingQueryRequest } from '@invoria/utils';

export interface ListReturnRequest extends PagingQueryRequest {
  type?: number | null;
}
