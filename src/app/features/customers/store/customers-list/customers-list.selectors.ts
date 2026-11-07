import { createSelector } from '@ngrx/store';

import { EMPTY_PAGING_INFO } from '../../../../core/models/paging';
import { LOAD_STATUS } from '../../../../shared/models/load-status';
import { customersListFeature } from './customers-list.reducer';

export const customersListSelectors = {
  selectPageIndex: customersListFeature.selectPageIndex,
  selectPageSize: customersListFeature.selectPageSize,
  selectNameFilter: customersListFeature.selectNameFilter,
  selectCustomers: customersListFeature.selectCustomers,
  selectInfo: customersListFeature.selectInfo,
  selectRequest: customersListFeature.selectRequest,

  selectIsLoading: createSelector(
    customersListFeature.selectRequest,
    (request) => request.status === LOAD_STATUS.Loading,
  ),

  selectStatus: createSelector(customersListFeature.selectRequest, (request) => request.status),

  selectError: createSelector(customersListFeature.selectRequest, (request) => request.error),

  /** Paging info with a stable empty fallback so the paginator never binds `null`. */
  selectPaging: createSelector(
    customersListFeature.selectInfo,
    (info) => info ?? EMPTY_PAGING_INFO,
  ),

  /** `first` offset for the PrimeNG paginator: `pageIndex * pageSize`. */
  selectFirst: createSelector(
    customersListFeature.selectPageIndex,
    customersListFeature.selectPageSize,
    (pageIndex, pageSize) => pageIndex * pageSize,
  ),

  /** Fetch request the current page was loaded with (for debugging/tests). */
  selectListRequest: createSelector(
    customersListFeature.selectPageIndex,
    customersListFeature.selectPageSize,
    customersListFeature.selectNameFilter,
    (pageIndex, pageSize, nameFilter): { Skip: number; Length: number; Name: string | null } => ({
      Skip: pageIndex * pageSize,
      Length: pageSize,
      Name: nameFilter || null,
    }),
  ),
} as const;
