import { createSelector } from '@ngrx/store';

import { EMPTY_PAGING_INFO } from '../../../../core/models/paging';
import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { ListOrderRequest } from '../../models/list-order.request';
import { ordersListFeature } from './orders-list.reducer';

export const ordersListSelectors = {
  selectPageIndex: ordersListFeature.selectPageIndex,
  selectPageSize: ordersListFeature.selectPageSize,
  selectOrderNumberFilter: ordersListFeature.selectOrderNumberFilter,
  selectStatusFilter: ordersListFeature.selectStatusFilter,
  selectPaymentStatusFilter: ordersListFeature.selectPaymentStatusFilter,
  selectPaymentTypeFilter: ordersListFeature.selectPaymentTypeFilter,
  selectOrders: ordersListFeature.selectOrders,
  selectInfo: ordersListFeature.selectInfo,
  selectRequest: ordersListFeature.selectRequest,

  selectIsLoading: createSelector(
    ordersListFeature.selectRequest,
    (request) => request.status === LOAD_STATUS.Loading,
  ),

  selectStatus: createSelector(ordersListFeature.selectRequest, (request) => request.status),

  selectError: createSelector(ordersListFeature.selectRequest, (request) => request.error),

  /** Paging info with a stable empty fallback so the paginator never binds `null`. */
  selectPaging: createSelector(
    ordersListFeature.selectInfo,
    (info) => info ?? EMPTY_PAGING_INFO,
  ),

  /** `first` offset for the PrimeNG paginator: `pageIndex * pageSize`. */
  selectFirst: createSelector(
    ordersListFeature.selectPageIndex,
    ordersListFeature.selectPageSize,
    (pageIndex, pageSize) => pageIndex * pageSize,
  ),

  /** Fetch request the current page was loaded with (for debugging/tests). */
  selectListRequest: createSelector(
    ordersListFeature.selectPageIndex,
    ordersListFeature.selectPageSize,
    ordersListFeature.selectOrderNumberFilter,
    ordersListFeature.selectStatusFilter,
    ordersListFeature.selectPaymentStatusFilter,
    ordersListFeature.selectPaymentTypeFilter,
    (pageIndex, pageSize, orderNumberFilter, statusFilter, paymentStatusFilter, paymentTypeFilter): ListOrderRequest => ({
      Skip: pageIndex * pageSize,
      Length: pageSize,
      IncludeOrderItems: true,
      OrderNumber: orderNumberFilter || null,
      ...(statusFilter !== null ? { Status: statusFilter } : {}),
      ...(paymentStatusFilter !== null ? { PaymentStatus: paymentStatusFilter } : {}),
      ...(paymentTypeFilter !== null ? { PaymentType: paymentTypeFilter } : {}),
    }),
  ),
} as const;
