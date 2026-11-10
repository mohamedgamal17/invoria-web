import { createSelector } from '@ngrx/store';

import { EMPTY_PAGING_INFO } from '../../../../core/models/paging';
import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { ListReceivableRequest } from '../../models/list-receivable.request';
import { receivablesListFeature } from './receivables-list.reducer';

export const receivablesListSelectors = {
  selectPageIndex: receivablesListFeature.selectPageIndex,
  selectPageSize: receivablesListFeature.selectPageSize,
  selectPartyIdFilter: receivablesListFeature.selectPartyIdFilter,
  selectSourceIdFilter: receivablesListFeature.selectSourceIdFilter,
  selectIsPaidFilter: receivablesListFeature.selectIsPaidFilter,
  selectReceivables: receivablesListFeature.selectReceivables,
  selectInfo: receivablesListFeature.selectInfo,
  selectRequest: receivablesListFeature.selectRequest,

  selectIsLoading: createSelector(
    receivablesListFeature.selectRequest,
    (request) => request.status === LOAD_STATUS.Loading,
  ),

  selectStatus: createSelector(receivablesListFeature.selectRequest, (request) => request.status),

  selectError: createSelector(receivablesListFeature.selectRequest, (request) => request.error),

  /** Paging info with a stable empty fallback so the paginator never binds `null`. */
  selectPaging: createSelector(
    receivablesListFeature.selectInfo,
    (info) => info ?? EMPTY_PAGING_INFO,
  ),

  /** `first` offset for the PrimeNG paginator: `pageIndex * pageSize`. */
  selectFirst: createSelector(
    receivablesListFeature.selectPageIndex,
    receivablesListFeature.selectPageSize,
    (pageIndex, pageSize) => pageIndex * pageSize,
  ),

  /** Fetch request the current page was loaded with (for debugging/tests). */
  selectListRequest: createSelector(
    receivablesListFeature.selectPageIndex,
    receivablesListFeature.selectPageSize,
    receivablesListFeature.selectPartyIdFilter,
    receivablesListFeature.selectSourceIdFilter,
    receivablesListFeature.selectIsPaidFilter,
    (pageIndex, pageSize, partyIdFilter, sourceIdFilter, isPaidFilter): ListReceivableRequest => ({
      Skip: pageIndex * pageSize,
      Length: pageSize,
      PartyId: partyIdFilter || null,
      SourceId: sourceIdFilter || null,
      IsPaid: isPaidFilter,
    }),
  ),
} as const;
