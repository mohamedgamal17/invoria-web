import { createAction, props } from '@ngrx/store';

import type { ReportOverview, ReportPeriod } from '@invoria/utils';
import type { CustomerCreationReportPeriod } from '@invoria/customers';
import type { ProductCreationReportPeriod } from '@invoria/catalog';
import type {
  OrderCompletionReportPeriod,
  OrderSalesProfitReportPeriod,
  OrderSalesReportPeriod,
} from '@invoria/sales';
import type { SupplierCreationReportPeriod, PurchaseSalesReportPeriod } from '@invoria/procurement';

/**
 * State module for the dashboard page:
 * seven per-entity report overviews (KPI cards) plus the per-period metrics
 * caches (sales-profit series / sales series) keyed by the selected `ReportPeriod`.
 */
export const DASHBOARD_ACTIONS = {
  /** Fetch all seven report overviews; each source may recover as `null` (partial tolerance). */
  loadOverviews: createAction('[Dashboard] Load Overviews'),

  /** `null` per source = that source failed; the reducer keeps the previously loaded value. */
  loadOverviewsSuccess: createAction(
    '[Dashboard] Load Overviews Success',
    props<{
      customers: ReportOverview<CustomerCreationReportPeriod> | null;
      products: ReportOverview<ProductCreationReportPeriod> | null;
      suppliers: ReportOverview<SupplierCreationReportPeriod> | null;
      orderSales: ReportOverview<OrderSalesReportPeriod> | null;
      orderProfit: ReportOverview<OrderSalesProfitReportPeriod> | null;
      orderCompletion: ReportOverview<OrderCompletionReportPeriod> | null;
      purchaseSales: ReportOverview<PurchaseSalesReportPeriod> | null;
    }>(),
  ),

  loadOverviewsFailure: createAction(
    '[Dashboard] Load Overviews Failure',
    props<{ error: unknown }>(),
  ),

  /** User picked a period in a chart card; the funnel then loads that period's metrics. */
  selectPeriod: createAction('[Dashboard] Select Period', props<{ period: ReportPeriod }>()),

  /** Internal: the single per-period fetch trigger; the reducer decides what still needs loading. */
  loadMetrics: createAction('[Dashboard] Load Metrics'),

  loadSalesProfitMetricsSuccess: createAction(
    '[Dashboard] Load Sales Profit Metrics Success',
    props<{ period: ReportPeriod; points: OrderSalesProfitReportPeriod[] }>(),
  ),

  loadSalesProfitMetricsFailure: createAction(
    '[Dashboard] Load Sales Profit Metrics Failure',
    props<{ period: ReportPeriod; error: unknown }>(),
  ),

  loadSalesMetricsSuccess: createAction(
    '[Dashboard] Load Sales Metrics Success',
    props<{ period: ReportPeriod; points: OrderSalesReportPeriod[] }>(),
  ),

  loadSalesMetricsFailure: createAction(
    '[Dashboard] Load Sales Metrics Failure',
    props<{ period: ReportPeriod; error: unknown }>(),
  ),

  /** Reload overviews and refetch the current period's metrics (after dropping their caches). */
  refresh: createAction('[Dashboard] Refresh'),
} as const;
