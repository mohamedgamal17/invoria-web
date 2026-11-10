import { createSelector } from '@ngrx/store';

import { EMPTY_PAGING_INFO } from '../../../../core/models/paging';
import { LOAD_STATUS } from '../../../../shared/models/load-status';
import { supplierDetailsSelectors } from '../supplier-details/supplier-details.selectors';
import { supplierPurchaseOrdersFeature } from './supplier-details-purchase-orders.reducer';

export const supplierPurchaseOrdersSelectors = {
  selectSupplierId: supplierPurchaseOrdersFeature.selectSupplierId,
  selectPurchaseOrdersTabOpened: supplierPurchaseOrdersFeature.selectPurchaseOrdersTabOpened,
  selectPageIndex: supplierPurchaseOrdersFeature.selectPageIndex,
  selectPageSize: supplierPurchaseOrdersFeature.selectPageSize,
  selectFilters: supplierPurchaseOrdersFeature.selectFilters,
  selectPurchaseOrders: supplierPurchaseOrdersFeature.selectPurchaseOrders,
  selectInfo: supplierPurchaseOrdersFeature.selectInfo,
  selectRequest: supplierPurchaseOrdersFeature.selectRequest,

  selectIsLoading: createSelector(
    supplierPurchaseOrdersFeature.selectRequest,
    (request) => request.status === LOAD_STATUS.Loading,
  ),

  selectStatus: createSelector(
    supplierPurchaseOrdersFeature.selectRequest,
    (request) => request.status,
  ),

  /** Paging info with a stable empty fallback so the paginator never binds `null`. */
  selectPaging: createSelector(
    supplierPurchaseOrdersFeature.selectInfo,
    (info) => info ?? EMPTY_PAGING_INFO,
  ),

  /** `first` offset for the PrimeNG paginator: `pageIndex * pageSize`. */
  selectFirst: createSelector(
    supplierPurchaseOrdersFeature.selectPageIndex,
    supplierPurchaseOrdersFeature.selectPageSize,
    (pageIndex, pageSize) => pageIndex * pageSize,
  ),

  /** Cross-store read: the loaded supplier entity (request building needs its `id`). */
  selectSupplier: supplierDetailsSelectors.selectSupplier,
  selectDetailsIsLoading: supplierDetailsSelectors.selectIsLoading,
} as const;
