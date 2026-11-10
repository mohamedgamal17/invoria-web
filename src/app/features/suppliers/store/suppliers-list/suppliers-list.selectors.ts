import { createSelector } from '@ngrx/store';

import { EMPTY_PAGING_INFO } from '../../../../core/models/paging';
import { LOAD_STATUS } from '../../../../shared/models/load-status';
import { suppliersListFeature } from './suppliers-list.reducer';

export const suppliersListSelectors = {
  selectPageIndex: suppliersListFeature.selectPageIndex,
  selectPageSize: suppliersListFeature.selectPageSize,
  selectNameFilter: suppliersListFeature.selectNameFilter,
  selectSuppliers: suppliersListFeature.selectSuppliers,
  selectInfo: suppliersListFeature.selectInfo,
  selectRequest: suppliersListFeature.selectRequest,

  selectIsLoading: createSelector(
    suppliersListFeature.selectRequest,
    (request) => request.status === LOAD_STATUS.Loading,
  ),

  selectStatus: createSelector(suppliersListFeature.selectRequest, (request) => request.status),

  selectError: createSelector(suppliersListFeature.selectRequest, (request) => request.error),

  /** Paging info with a stable empty fallback so the paginator never binds `null`. */
  selectPaging: createSelector(
    suppliersListFeature.selectInfo,
    (info) => info ?? EMPTY_PAGING_INFO,
  ),

  /** `first` offset for the PrimeNG paginator: `pageIndex * pageSize`. */
  selectFirst: createSelector(
    suppliersListFeature.selectPageIndex,
    suppliersListFeature.selectPageSize,
    (pageIndex, pageSize) => pageIndex * pageSize,
  ),

  /** Fetch request the current page was loaded with (for debugging/tests). */
  selectListRequest: createSelector(
    suppliersListFeature.selectPageIndex,
    suppliersListFeature.selectPageSize,
    suppliersListFeature.selectNameFilter,
    (pageIndex, pageSize, nameFilter): { Skip: number; Length: number; Name: string | null } => ({
      Skip: pageIndex * pageSize,
      Length: pageSize,
      Name: nameFilter || null,
    }),
  ),
} as const;
