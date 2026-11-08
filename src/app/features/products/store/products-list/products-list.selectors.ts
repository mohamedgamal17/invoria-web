import { createSelector } from '@ngrx/store';

import { EMPTY_PAGING_INFO } from '../../../../core/models/paging';
import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { ListProductRequest } from '../../models/list-product.request';
import { productsListFeature } from './products-list.reducer';

export const productsListSelectors = {
  selectPageIndex: productsListFeature.selectPageIndex,
  selectPageSize: productsListFeature.selectPageSize,
  selectNameFilter: productsListFeature.selectNameFilter,
  selectProducts: productsListFeature.selectProducts,
  selectInfo: productsListFeature.selectInfo,
  selectRequest: productsListFeature.selectRequest,

  selectIsLoading: createSelector(
    productsListFeature.selectRequest,
    (request) => request.status === LOAD_STATUS.Loading,
  ),

  selectStatus: createSelector(productsListFeature.selectRequest, (request) => request.status),

  selectError: createSelector(productsListFeature.selectRequest, (request) => request.error),

  /** Paging info with a stable empty fallback so the paginator never binds `null`. */
  selectPaging: createSelector(
    productsListFeature.selectInfo,
    (info) => info ?? EMPTY_PAGING_INFO,
  ),

  /** `first` offset for the PrimeNG paginator: `pageIndex * pageSize`. */
  selectFirst: createSelector(
    productsListFeature.selectPageIndex,
    productsListFeature.selectPageSize,
    (pageIndex, pageSize) => pageIndex * pageSize,
  ),

  /** Fetch request the current page was loaded with (for debugging/tests). */
  selectListRequest: createSelector(
    productsListFeature.selectPageIndex,
    productsListFeature.selectPageSize,
    productsListFeature.selectNameFilter,
    (pageIndex, pageSize, nameFilter): ListProductRequest => ({
      Skip: pageIndex * pageSize,
      Length: pageSize,
      ...(nameFilter ? { Name: nameFilter } : {}),
    }),
  ),
} as const;
