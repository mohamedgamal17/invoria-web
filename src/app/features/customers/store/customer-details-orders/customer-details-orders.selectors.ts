import { createSelector } from '@ngrx/store';

import { EMPTY_PAGING_INFO } from '../../../../core/models/paging';
import { LOAD_STATUS } from '../../../../shared/models/load-status';
import { customerDetailsSelectors } from '../customer-details/customer-details.selectors';
import { customerOrdersFeature } from './customer-details-orders.reducer';

export const customerOrdersSelectors = {
  selectCustomerId: customerOrdersFeature.selectCustomerId,
  selectOrdersTabOpened: customerOrdersFeature.selectOrdersTabOpened,
  selectPageIndex: customerOrdersFeature.selectPageIndex,
  selectPageSize: customerOrdersFeature.selectPageSize,
  selectFilters: customerOrdersFeature.selectFilters,
  selectOrders: customerOrdersFeature.selectOrders,
  selectInfo: customerOrdersFeature.selectInfo,
  selectRequest: customerOrdersFeature.selectRequest,

  selectIsLoading: createSelector(
    customerOrdersFeature.selectRequest,
    (request) => request.status === LOAD_STATUS.Loading,
  ),

  selectStatus: createSelector(customerOrdersFeature.selectRequest, (request) => request.status),

  /** Paging info with a stable empty fallback so the paginator never binds `null`. */
  selectPaging: createSelector(
    customerOrdersFeature.selectInfo,
    (info) => info ?? EMPTY_PAGING_INFO,
  ),

  /** `first` offset for the PrimeNG paginator: `pageIndex * pageSize`. */
  selectFirst: createSelector(
    customerOrdersFeature.selectPageIndex,
    customerOrdersFeature.selectPageSize,
    (pageIndex, pageSize) => pageIndex * pageSize,
  ),

  /** Cross-store read: the loaded customer entity (request building needs its `id`). */
  selectCustomer: customerDetailsSelectors.selectCustomer,
  selectDetailsIsLoading: customerDetailsSelectors.selectIsLoading,
} as const;
