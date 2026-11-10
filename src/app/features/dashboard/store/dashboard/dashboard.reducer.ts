import { createFeature, createReducer, on } from '@ngrx/store';

import type { ReportOverview } from '../../../../shared/models/report-overview';
import { LOAD_STATUS } from '../../../../shared/models/load-status';
import {
  INITIAL_ASYNC_REQUEST_STATE,
  applyFailure,
  startLoading,
  type AsyncRequestState,
} from '../../../../shared/models/async-request-state';
import { ReportPeriod } from '../../../../shared/models/report-period';
import type { CustomerCreationReportPeriod } from '../../../customers/models/customer-report.entity';
import type { ProductCreationReportPeriod } from '../../../products/models/product-report.entity';
import type {
  OrderCompletionReportPeriod,
  OrderSalesProfitReportPeriod,
  OrderSalesReportPeriod
} from '../../../orders/models/order-report.entity';
import type { SupplierCreationReportPeriod } from '../../../suppliers/models/supplier-report.entity';
import type { PurchaseSalesReportPeriod } from '../../../procurement/models/purchase-order-report.entity';
import { DASHBOARD_ACTIONS } from './dashboard.actions';

export const DASHBOARD_FEATURE_KEY = 'dashboard';

/** One snapshot per source; `null` = not loaded yet (or the source failed and nothing is cached). */
export interface DashboardOverviews {
  customers: ReportOverview<CustomerCreationReportPeriod> | null;
  products: ReportOverview<ProductCreationReportPeriod> | null;
  suppliers: ReportOverview<SupplierCreationReportPeriod> | null;
  orderSales: ReportOverview<OrderSalesReportPeriod> | null;
  orderProfit: ReportOverview<OrderSalesProfitReportPeriod> | null;
  orderCompletion: ReportOverview<OrderCompletionReportPeriod> | null;
  purchaseSales: ReportOverview<PurchaseSalesReportPeriod> | null;
}

export interface DashboardState {
  /** Period behind both chart cards; defaults to `Daily` (first visit shows the daily series). */
  selectedPeriod: ReportPeriod;
  overviews: DashboardOverviews;
  request: AsyncRequestState;
  /** Sales-profit series per period, most recent first straight from the API. */
  salesProfitByPeriod: Partial<Record<ReportPeriod, OrderSalesProfitReportPeriod[]>>;
  /** Sales series per period, most recent first straight from the API. */
  salesByPeriod: Partial<Record<ReportPeriod, OrderSalesReportPeriod[]>>;
  /** Periods with a sales-profit metrics request in flight. */
  salesProfitLoadingPeriods: ReportPeriod[];
  /** Periods with a sales metrics request in flight. */
  salesLoadingPeriods: ReportPeriod[];
}

export const DASHBOARD_INITIAL_STATE: DashboardState = {
  selectedPeriod: ReportPeriod.Daily,
  overviews: {
    customers: null,
    products: null,
    suppliers: null,
    orderSales: null,
    orderProfit: null,
    orderCompletion: null,
    purchaseSales: null,
  },
  request: INITIAL_ASYNC_REQUEST_STATE,
  salesProfitByPeriod: {},
  salesByPeriod: {},
  salesProfitLoadingPeriods: [],
  salesLoadingPeriods: [],
};

/** True when the period already has a sales-profit series cached. */
function hasSalesProfitCache(state: DashboardState, period: ReportPeriod): boolean {
  return state.salesProfitByPeriod[period] !== undefined;
}

/** True when the period already has a sales series cached. */
function hasSalesCache(state: DashboardState, period: ReportPeriod): boolean {
  return state.salesByPeriod[period] !== undefined;
}

/** Drops one period from a loading list, keeping the array reference when untouched. */
function withoutPeriod(periods: ReportPeriod[], period: ReportPeriod): ReportPeriod[] {
  const filtered = periods.filter((pendingPeriod) => pendingPeriod !== period);
  return filtered.length === periods.length ? periods : filtered;
}

export const dashboardReducer = createReducer(
  DASHBOARD_INITIAL_STATE,

  /**
   * Starts loading when idle/loaded/failed; duplicates while already loading
   * no-op so the effect can dedupe in-flight triggers by state reference.
   */
  on(DASHBOARD_ACTIONS.loadOverviews, (state) => {
    if (state.request.status === LOAD_STATUS.Loading) {
      return state;
    }
    return { ...state, request: startLoading(state.request) };
  }),

  /** Merges every non-null source; failed sources keep their previously loaded value. */
  on(DASHBOARD_ACTIONS.loadOverviewsSuccess, (state, action) => ({
    ...state,
    overviews: {
      customers: action.customers ?? state.overviews.customers,
      products: action.products ?? state.overviews.products,
      suppliers: action.suppliers ?? state.overviews.suppliers,
      orderSales: action.orderSales ?? state.overviews.orderSales,
      orderProfit: action.orderProfit ?? state.overviews.orderProfit,
      orderCompletion: action.orderCompletion ?? state.overviews.orderCompletion,
      purchaseSales: action.purchaseSales ?? state.overviews.purchaseSales,
    },
    request: { ...state.request, status: LOAD_STATUS.Loaded, error: null },
  })),

  on(DASHBOARD_ACTIONS.loadOverviewsFailure, (state, { error }) => ({
    ...state,
    request: applyFailure(state.request, error),
  })),

  // Selecting the same period again is a no-op so duplicate triggers stay dedupable
  // by state reference; a real change re-funnels into the per-period metric loads.
  on(DASHBOARD_ACTIONS.selectPeriod, (state, { period }) => {
    if (state.selectedPeriod === period) {
      return state;
    }
    return { ...state, selectedPeriod: period };
  }),

  /**
   * The state decides which fetches go in flight: only periods missing a cache
   * AND not already in flight are marked loading; the rest no-ops.
   */
  on(DASHBOARD_ACTIONS.loadMetrics, (state) => {
    const period = state.selectedPeriod;
    const needsSalesProfit = !hasSalesProfitCache(state, period)
      && !state.salesProfitLoadingPeriods.includes(period);
    const needsSales = !hasSalesCache(state, period)
      && !state.salesLoadingPeriods.includes(period);
    if (!needsSalesProfit && !needsSales) {
      return state;
    }
    return {
      ...state,
      salesProfitLoadingPeriods: needsSalesProfit
        ? [...state.salesProfitLoadingPeriods, period]
        : state.salesProfitLoadingPeriods,
      salesLoadingPeriods: needsSales
        ? [...state.salesLoadingPeriods, period]
        : state.salesLoadingPeriods,
    };
  }),

  // Cache the fetched series and release its in-flight marker; the period stays
  // cached so switching back needs no refetch.
  on(DASHBOARD_ACTIONS.loadSalesProfitMetricsSuccess, (state, { period, points }) => ({
    ...state,
    salesProfitByPeriod: { ...state.salesProfitByPeriod, [period]: points },
    salesProfitLoadingPeriods: withoutPeriod(state.salesProfitLoadingPeriods, period),
  })),

  on(DASHBOARD_ACTIONS.loadSalesProfitMetricsFailure, (state, { period }) => ({
    ...state,
    // The period stays uncached so the next trigger can retry it.
    salesProfitLoadingPeriods: withoutPeriod(state.salesProfitLoadingPeriods, period),
  })),

  on(DASHBOARD_ACTIONS.loadSalesMetricsSuccess, (state, { period, points }) => ({
    ...state,
    salesByPeriod: { ...state.salesByPeriod, [period]: points },
    salesLoadingPeriods: withoutPeriod(state.salesLoadingPeriods, period),
  })),

  on(DASHBOARD_ACTIONS.loadSalesMetricsFailure, (state, { period }) => ({
    ...state,
    salesLoadingPeriods: withoutPeriod(state.salesLoadingPeriods, period),
  })),

  /**
   * Refresh drops the current period's caches so re-funnels into real metric
   * fetches; the overviews reload is funneled by the effect (its in-flight
   * guard lives on the `loadOverviews` reducer pass).
   */
  on(DASHBOARD_ACTIONS.refresh, (state) => {
    const { [state.selectedPeriod]: droppedProfit, ...salesProfitByPeriod } = state.salesProfitByPeriod;
    const { [state.selectedPeriod]: droppedSales, ...salesByPeriod } = state.salesByPeriod;
    return { ...state, salesProfitByPeriod, salesByPeriod };
  }),
);

export const dashboardFeature = createFeature({
  name: DASHBOARD_FEATURE_KEY,
  reducer: dashboardReducer,
});
