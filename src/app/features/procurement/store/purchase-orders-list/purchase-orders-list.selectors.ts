import { createSelector } from '@ngrx/store';

import { EMPTY_PAGING_INFO } from '../../../../core/models/paging';
import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { ListPurchaseOrderRequest } from '../../models/list-purchase-order.request';
import { purchaseOrdersListFeature } from './purchase-orders-list.reducer';

export const purchaseOrdersListSelectors = {
  selectPageIndex: purchaseOrdersListFeature.selectPageIndex,
  selectPageSize: purchaseOrdersListFeature.selectPageSize,
  selectNumberFilter: purchaseOrdersListFeature.selectNumberFilter,
  selectStatusFilter: purchaseOrdersListFeature.selectStatusFilter,
  selectPurchaseOrders: purchaseOrdersListFeature.selectPurchaseOrders,
  selectInfo: purchaseOrdersListFeature.selectInfo,
  selectRequest: purchaseOrdersListFeature.selectRequest,

  selectIsLoading: createSelector(
    purchaseOrdersListFeature.selectRequest,
    (request) => request.status === LOAD_STATUS.Loading,
  ),

  selectStatus: createSelector(
    purchaseOrdersListFeature.selectRequest,
    (request) => request.status,
  ),

  selectError: createSelector(purchaseOrdersListFeature.selectRequest, (request) => request.error),

  /** Paging info with a stable empty fallback so the paginator never binds `null`. */
  selectPaging: createSelector(
    purchaseOrdersListFeature.selectInfo,
    (info) => info ?? EMPTY_PAGING_INFO,
  ),

  /** `first` offset for the PrimeNG paginator: `pageIndex * pageSize`. */
  selectFirst: createSelector(
    purchaseOrdersListFeature.selectPageIndex,
    purchaseOrdersListFeature.selectPageSize,
    (pageIndex, pageSize) => pageIndex * pageSize,
  ),

  /** Fetch request the current page was loaded with (for debugging/tests). */
  selectListRequest: createSelector(
    purchaseOrdersListFeature.selectPageIndex,
    purchaseOrdersListFeature.selectPageSize,
    purchaseOrdersListFeature.selectNumberFilter,
    purchaseOrdersListFeature.selectStatusFilter,
    (pageIndex, pageSize, numberFilter, statusFilter): ListPurchaseOrderRequest => ({
      Skip: pageIndex * pageSize,
      Length: pageSize,
      Number: numberFilter || null,
      IncludePurchaseItems: false,
      IncludeSupplier: true,
      ...(statusFilter != null ? { Status: statusFilter } : {}),
    }),
  ),
} as const;
