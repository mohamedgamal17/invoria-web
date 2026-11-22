import { createSelector } from '@ngrx/store';

import { EMPTY_PAGING_INFO } from '@invoria/core';
import { LOAD_STATUS } from '@invoria/utils';
import type { ListProductRequest } from '@invoria/catalog/models/list-product.request';
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
      skip: pageIndex * pageSize,
      length: pageSize,
      ...(nameFilter ? { name: nameFilter } : {}),
    }),
  ),
} as const;
