import { createSelector } from '@ngrx/store';

import { EMPTY_PAGING_INFO } from '../../../../core/models/paging';
import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { ListPayableRequest } from '../../models/list-payable.request';
import { payablesListFeature } from './payables-list.reducer';

export const payablesListSelectors = {
  selectPageIndex: payablesListFeature.selectPageIndex,
  selectPageSize: payablesListFeature.selectPageSize,
  selectSupplierIdFilter: payablesListFeature.selectSupplierIdFilter,
  selectSourceIdFilter: payablesListFeature.selectSourceIdFilter,
  selectIsPaidFilter: payablesListFeature.selectIsPaidFilter,
  selectPayables: payablesListFeature.selectPayables,
  selectInfo: payablesListFeature.selectInfo,
  selectRequest: payablesListFeature.selectRequest,

  selectIsLoading: createSelector(
    payablesListFeature.selectRequest,
    (request) => request.status === LOAD_STATUS.Loading,
  ),

  selectStatus: createSelector(payablesListFeature.selectRequest, (request) => request.status),

  selectError: createSelector(payablesListFeature.selectRequest, (request) => request.error),

  /** Paging info with a stable empty fallback so the paginator never binds `null`. */
  selectPaging: createSelector(
    payablesListFeature.selectInfo,
    (info) => info ?? EMPTY_PAGING_INFO,
  ),

  /** `first` offset for the PrimeNG paginator: `pageIndex * pageSize`. */
  selectFirst: createSelector(
    payablesListFeature.selectPageIndex,
    payablesListFeature.selectPageSize,
    (pageIndex, pageSize) => pageIndex * pageSize,
  ),

  /** Fetch request the current page was loaded with (for debugging/tests). */
  selectListRequest: createSelector(
    payablesListFeature.selectPageIndex,
    payablesListFeature.selectPageSize,
    payablesListFeature.selectSupplierIdFilter,
    payablesListFeature.selectSourceIdFilter,
    payablesListFeature.selectIsPaidFilter,
    (pageIndex, pageSize, supplierIdFilter, sourceIdFilter, isPaidFilter): ListPayableRequest => ({
      Skip: pageIndex * pageSize,
      Length: pageSize,
      PartyId: supplierIdFilter || null,
      SourceId: sourceIdFilter || null,
      IsPaid: isPaidFilter,
    }),
  ),
} as const;
