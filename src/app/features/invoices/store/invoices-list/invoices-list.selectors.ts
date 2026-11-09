import { createSelector } from '@ngrx/store';

import { EMPTY_PAGING_INFO } from '../../../../core/models/paging';
import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { ListInvoiceRequest } from '../../models/list-invoice.request';
import { invoicesListFeature } from './invoices-list.reducer';

export const invoicesListSelectors = {
  selectPageIndex: invoicesListFeature.selectPageIndex,
  selectPageSize: invoicesListFeature.selectPageSize,
  selectCustomerIdFilter: invoicesListFeature.selectCustomerIdFilter,
  selectOrderIdFilter: invoicesListFeature.selectOrderIdFilter,
  selectInvoices: invoicesListFeature.selectInvoices,
  selectInfo: invoicesListFeature.selectInfo,
  selectRequest: invoicesListFeature.selectRequest,

  selectIsLoading: createSelector(
    invoicesListFeature.selectRequest,
    (request) => request.status === LOAD_STATUS.Loading,
  ),

  selectStatus: createSelector(invoicesListFeature.selectRequest, (request) => request.status),

  selectError: createSelector(invoicesListFeature.selectRequest, (request) => request.error),

  /** Paging info with a stable empty fallback so the paginator never binds `null`. */
  selectPaging: createSelector(
    invoicesListFeature.selectInfo,
    (info) => info ?? EMPTY_PAGING_INFO,
  ),

  /** `first` offset for the PrimeNG paginator: `pageIndex * pageSize`. */
  selectFirst: createSelector(
    invoicesListFeature.selectPageIndex,
    invoicesListFeature.selectPageSize,
    (pageIndex, pageSize) => pageIndex * pageSize,
  ),

  /** Fetch request the current page was loaded with (for debugging/tests). */
  selectListRequest: createSelector(
    invoicesListFeature.selectPageIndex,
    invoicesListFeature.selectPageSize,
    invoicesListFeature.selectCustomerIdFilter,
    invoicesListFeature.selectOrderIdFilter,
    (pageIndex, pageSize, customerIdFilter, orderIdFilter): ListInvoiceRequest => ({
      Skip: pageIndex * pageSize,
      Length: pageSize,
      ...(customerIdFilter ? { CustomerId: customerIdFilter } : {}),
      ...(orderIdFilter ? { OrderId: orderIdFilter } : {}),
    }),
  ),
} as const;
