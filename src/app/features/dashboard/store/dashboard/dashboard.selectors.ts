import { createSelector } from '@ngrx/store';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { OrderSalesProfitReportPeriod } from '../../../orders/models/order-report.entity';
import type { OrderSalesReportPeriod } from '../../../orders/models/order-report.entity';
import { dashboardFeature } from './dashboard.reducer';

/** Stable empty series so chart bindings never see a fresh `[]` reference. */
const EMPTY_SALES_PROFIT_SERIES: OrderSalesProfitReportPeriod[] = [];
const EMPTY_SALES_SERIES: OrderSalesReportPeriod[] = [];

export const dashboardSelectors = {
  selectSelectedPeriod: dashboardFeature.selectSelectedPeriod,
  selectOverviews: dashboardFeature.selectOverviews,
  selectRequest: dashboardFeature.selectRequest,
  selectSalesProfitByPeriod: dashboardFeature.selectSalesProfitByPeriod,
  selectSalesByPeriod: dashboardFeature.selectSalesByPeriod,
  selectSalesProfitLoadingPeriods: dashboardFeature.selectSalesProfitLoadingPeriods,
  selectSalesLoadingPeriods: dashboardFeature.selectSalesLoadingPeriods,

  selectIsOverviewLoading: createSelector(
    dashboardFeature.selectRequest,
    (request) => request.status === LOAD_STATUS.Loading,
  ),

  selectCustomerOverview: createSelector(
    dashboardFeature.selectOverviews,
    (overviews) => overviews.customers,
  ),

  selectProductOverview: createSelector(
    dashboardFeature.selectOverviews,
    (overviews) => overviews.products,
  ),

  selectSupplierOverview: createSelector(
    dashboardFeature.selectOverviews,
    (overviews) => overviews.suppliers,
  ),

  selectOrderSalesOverview: createSelector(
    dashboardFeature.selectOverviews,
    (overviews) => overviews.orderSales,
  ),

  selectOrderProfitOverview: createSelector(
    dashboardFeature.selectOverviews,
    (overviews) => overviews.orderProfit,
  ),

  selectOrderCompletionOverview: createSelector(
    dashboardFeature.selectOverviews,
    (overviews) => overviews.orderCompletion,
  ),

  selectPurchaseSalesOverview: createSelector(
    dashboardFeature.selectOverviews,
    (overviews) => overviews.purchaseSales,
  ),

  /** Series of the selected period, or an empty series while its fetch is in flight/uncached. */
  selectSalesProfitSeries: createSelector(
    dashboardFeature.selectSelectedPeriod,
    dashboardFeature.selectSalesProfitByPeriod,
    (selectedPeriod, salesProfitByPeriod) =>
      salesProfitByPeriod[selectedPeriod] ?? EMPTY_SALES_PROFIT_SERIES,
  ),

  selectSalesSeries: createSelector(
    dashboardFeature.selectSelectedPeriod,
    dashboardFeature.selectSalesByPeriod,
    (selectedPeriod, salesByPeriod) => salesByPeriod[selectedPeriod] ?? EMPTY_SALES_SERIES,
  ),

  selectIsMetricsLoading: createSelector(
    dashboardFeature.selectSalesProfitLoadingPeriods,
    dashboardFeature.selectSalesLoadingPeriods,
    dashboardFeature.selectSelectedPeriod,
    (salesProfitLoadingPeriods, salesLoadingPeriods, selectedPeriod) =>
      salesProfitLoadingPeriods.includes(selectedPeriod)
      || salesLoadingPeriods.includes(selectedPeriod),
  ),
} as const;
