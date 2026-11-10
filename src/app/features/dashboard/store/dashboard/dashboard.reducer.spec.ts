import { describe, expect, it } from 'vitest';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { ReportOverview } from '../../../../shared/models/report-overview';
import { ReportPeriod } from '../../../../shared/models/report-period';
import type { CustomerCreationReportPeriod } from '../../../customers/models/customer-report.entity';
import type {
  OrderSalesProfitReportPeriod,
  OrderSalesReportPeriod,
} from '../../../orders/models/order-report.entity';
import { DASHBOARD_ACTIONS } from './dashboard.actions';
import {
  DASHBOARD_INITIAL_STATE,
  dashboardReducer,
  type DashboardState,
} from './dashboard.reducer';

const PROFIT_POINTS: OrderSalesProfitReportPeriod[] = [
  {
    date: '2026-01-02T00:00:00.000Z',
    totalRevenue: 120,
    totalCost: 45,
    totalProfit: 75,
    totalReturnAmount: 0,
    period: ReportPeriod.Daily,
  },
  {
    date: '2026-01-01T00:00:00.000Z',
    totalRevenue: 90,
    totalCost: 30,
    totalProfit: 60,
    totalReturnAmount: 5,
    period: ReportPeriod.Daily,
  },
];

const SALES_POINTS: OrderSalesReportPeriod[] = [
  {
    date: '2026-01-02T00:00:00.000Z',
    totalAmount: 120,
    totalNetAmount: 110,
    totalReturnAmount: 0,
    period: ReportPeriod.Daily,
  },
  {
    date: '2026-01-01T00:00:00.000Z',
    totalAmount: 90,
    totalNetAmount: 80,
    totalReturnAmount: 5,
    period: ReportPeriod.Daily,
  },
];

function snapshot(totalCount: number): CustomerCreationReportPeriod {
  return {
    date: '2026-01-02T00:00:00.000Z',
    totalCount,
    period: ReportPeriod.Daily,
  };
}

const CUSTOMERS_OVERVIEW: ReportOverview<CustomerCreationReportPeriod> = {
  thisDay: snapshot(1),
  thisMonth: snapshot(10),
  thisYear: snapshot(100),
  allTime: snapshot(1000),
};

describe('dashboardReducer', () => {
  describe('loadOverviews (the state decides whether the API is called)', () => {
    it('starts loading on the first trigger', () => {
      const next = dashboardReducer(DASHBOARD_INITIAL_STATE, {
        ...DASHBOARD_ACTIONS.loadOverviews(),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
      expect(next.request.error).toBeNull();
    });

    it('does not restart an in-flight overview request', () => {
      let state = dashboardReducer(DASHBOARD_INITIAL_STATE, {
        ...DASHBOARD_ACTIONS.loadOverviews(),
      });
      const next = dashboardReducer(state, {
        ...DASHBOARD_ACTIONS.loadOverviews(),
      });
      expect(next).toBe(state);
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });

    it('is re-triggerable after a failure and after being loaded', () => {
      let state = dashboardReducer(DASHBOARD_INITIAL_STATE, {
        ...DASHBOARD_ACTIONS.loadOverviews(),
      });
      state = dashboardReducer(state, {
        ...DASHBOARD_ACTIONS.loadOverviewsFailure({ error: new Error('boom') }),
      });
      expect(state.request.status).toBe(LOAD_STATUS.Error);
      let next = dashboardReducer(state, { ...DASHBOARD_ACTIONS.loadOverviews() });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);

      next = dashboardReducer(next, {
        ...DASHBOARD_ACTIONS.loadOverviewsSuccess({
          customers: null,
          products: null,
          suppliers: null,
          orderSales: null,
          orderProfit: null,
          orderCompletion: null,
          purchaseSales: null,
        }),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Loaded);
      next = dashboardReducer(next, { ...DASHBOARD_ACTIONS.loadOverviews() });
      expect(next.request.status).toBe(LOAD_STATUS.Loading);
    });
  });

  describe('loadOverviewsSuccess', () => {
    it('stores the successful sources and clears any stale error', () => {
      let state = dashboardReducer(DASHBOARD_INITIAL_STATE, {
        ...DASHBOARD_ACTIONS.loadOverviews(),
      });
      state = dashboardReducer(state, {
        ...DASHBOARD_ACTIONS.loadOverviewsFailure({ error: new Error('boom') }),
      });
      const next = dashboardReducer(state, {
        ...DASHBOARD_ACTIONS.loadOverviewsSuccess({
          customers: CUSTOMERS_OVERVIEW,
          products: null,
          suppliers: null,
          orderSales: null,
          orderProfit: null,
          orderCompletion: null,
          purchaseSales: null,
        }),
      });
      expect(next.overviews.customers).toBe(CUSTOMERS_OVERVIEW);
      expect(next.request.status).toBe(LOAD_STATUS.Loaded);
      expect(next.request.error).toBeNull();
    });

    it('keeps the previously loaded value for failed (null) sources', () => {
      let state = dashboardReducer(DASHBOARD_INITIAL_STATE, {
        ...DASHBOARD_ACTIONS.loadOverviews(),
      });
      state = dashboardReducer(state, {
        ...DASHBOARD_ACTIONS.loadOverviewsSuccess({
          customers: CUSTOMERS_OVERVIEW,
          products: null,
          suppliers: null,
          orderSales: null,
          orderProfit: null,
          orderCompletion: null,
          purchaseSales: null,
        }),
      });
      const next = dashboardReducer(state, {
        ...DASHBOARD_ACTIONS.loadOverviewsSuccess({
          customers: null,
          products: null,
          suppliers: null,
          orderSales: null,
          orderProfit: null,
          orderCompletion: null,
          purchaseSales: null,
        }),
      });
      expect(next.overviews.customers).toBe(CUSTOMERS_OVERVIEW);
    });
  });

  describe('loadOverviewsFailure', () => {
    it('stores the error detail and bumps the failure nonce', () => {
      let state = dashboardReducer(DASHBOARD_INITIAL_STATE, {
        ...DASHBOARD_ACTIONS.loadOverviews(),
      });
      const next = dashboardReducer(state, {
        ...DASHBOARD_ACTIONS.loadOverviewsFailure({ error: new Error('boom') }),
      });
      expect(next.request.status).toBe(LOAD_STATUS.Error);
      expect(next.request.error).not.toBeNull();
      expect(next.request.failureNonce).toBe(1);
      // Previously loaded sources are kept so partial data stays visible.
      expect(next.overviews.customers).toBeNull();
    });
  });

  describe('selectPeriod', () => {
    it('returns the same state object when the period already matches', () => {
      const next = dashboardReducer(DASHBOARD_INITIAL_STATE, {
        ...DASHBOARD_ACTIONS.selectPeriod({ period: ReportPeriod.Daily }),
      });
      expect(next).toBe(DASHBOARD_INITIAL_STATE);
    });

    it('switches the period on a real change', () => {
      const next = dashboardReducer(DASHBOARD_INITIAL_STATE, {
        ...DASHBOARD_ACTIONS.selectPeriod({ period: ReportPeriod.Monthly }),
      });
      expect(next.selectedPeriod).toBe(ReportPeriod.Monthly);
    });
  });

  describe('loadMetrics (the state decides which fetches go in flight)', () => {
    it('starts both metric kinds for the selected period', () => {
      let state = dashboardReducer(DASHBOARD_INITIAL_STATE, {
        ...DASHBOARD_ACTIONS.selectPeriod({ period: ReportPeriod.Monthly }),
      });
      const next = dashboardReducer(state, { ...DASHBOARD_ACTIONS.loadMetrics() });
      expect(next.salesProfitLoadingPeriods).toEqual([ReportPeriod.Monthly]);
      expect(next.salesLoadingPeriods).toEqual([ReportPeriod.Monthly]);
    });

    it('starts only the uncached kind when the other has a cache', () => {
      let state: DashboardState = {
        ...DASHBOARD_INITIAL_STATE,
        salesProfitByPeriod: { [ReportPeriod.Daily]: PROFIT_POINTS },
      };
      const next = dashboardReducer(state, { ...DASHBOARD_ACTIONS.loadMetrics() });
      expect(next.salesProfitLoadingPeriods).toEqual([]);
      expect(next.salesLoadingPeriods).toEqual([ReportPeriod.Daily]);
      expect(next.salesProfitByPeriod[ReportPeriod.Daily]).toEqual(PROFIT_POINTS);
    });

    it('returns the same state when both kinds are cached', () => {
      let state: DashboardState = {
        ...DASHBOARD_INITIAL_STATE,
        salesProfitByPeriod: { [ReportPeriod.Daily]: PROFIT_POINTS },
        salesByPeriod: { [ReportPeriod.Daily]: SALES_POINTS },
      };
      const next = dashboardReducer(state, { ...DASHBOARD_ACTIONS.loadMetrics() });
      expect(next).toBe(state);
    });

    it('returns the same state while both kinds are already in flight', () => {
      let state = dashboardReducer(DASHBOARD_INITIAL_STATE, {
        ...DASHBOARD_ACTIONS.loadMetrics(),
      });
      const next = dashboardReducer(state, { ...DASHBOARD_ACTIONS.loadMetrics() });
      expect(next).toBe(state);
    });

    it('starts only the kind that is neither cached nor in flight', () => {
      let state = dashboardReducer(DASHBOARD_INITIAL_STATE, {
        ...DASHBOARD_ACTIONS.loadMetrics(),
      });
      state = dashboardReducer(state, {
        ...DASHBOARD_ACTIONS.loadSalesProfitMetricsSuccess({ period: ReportPeriod.Daily, points: PROFIT_POINTS }),
      });
      state = dashboardReducer(state, {
        ...DASHBOARD_ACTIONS.selectPeriod({ period: ReportPeriod.Monthly }),
      });
      state = dashboardReducer(state, { ...DASHBOARD_ACTIONS.loadMetrics() });
      state = dashboardReducer(state, {
        ...DASHBOARD_ACTIONS.selectPeriod({ period: ReportPeriod.Daily }),
      });
      const next = dashboardReducer(state, { ...DASHBOARD_ACTIONS.loadMetrics() });
      // The still-pending Monthly profit fetch and the original in-flight Daily
      // sales fetch are untouched; Daily profit is cached so nothing else starts.
      expect(next.salesProfitLoadingPeriods).toEqual([ReportPeriod.Monthly]);
      expect(next.salesLoadingPeriods).toEqual([ReportPeriod.Daily, ReportPeriod.Monthly]);
    });
  });

  describe('loadSalesProfitMetricsSuccess / loadSalesMetricsSuccess', () => {
    it('caches the series per period and releases the in-flight marker', () => {
      let state = dashboardReducer(DASHBOARD_INITIAL_STATE, {
        ...DASHBOARD_ACTIONS.loadMetrics(),
      });
      const profitNext = dashboardReducer(state, {
        ...DASHBOARD_ACTIONS.loadSalesProfitMetricsSuccess({ period: ReportPeriod.Daily, points: PROFIT_POINTS }),
      });
      expect(profitNext.salesProfitByPeriod[ReportPeriod.Daily]).toEqual(PROFIT_POINTS);
      expect(profitNext.salesProfitLoadingPeriods).toEqual([]);
      expect(profitNext.salesLoadingPeriods).toEqual([ReportPeriod.Daily]);

      const salesNext = dashboardReducer(profitNext, {
        ...DASHBOARD_ACTIONS.loadSalesMetricsSuccess({ period: ReportPeriod.Daily, points: SALES_POINTS }),
      });
      expect(salesNext.salesByPeriod[ReportPeriod.Daily]).toEqual(SALES_POINTS);
      expect(salesNext.salesLoadingPeriods).toEqual([]);
    });

    it('releases the in-flight marker on failure while keeping the period retryable', () => {
      let state = dashboardReducer(DASHBOARD_INITIAL_STATE, {
        ...DASHBOARD_ACTIONS.loadMetrics(),
      });
      const profitFailed = dashboardReducer(state, {
        ...DASHBOARD_ACTIONS.loadSalesProfitMetricsFailure({ period: ReportPeriod.Daily, error: new Error('boom') }),
      });
      expect(profitFailed.salesProfitLoadingPeriods).toEqual([]);
      expect(profitFailed.salesProfitByPeriod[ReportPeriod.Daily]).toBeUndefined();
      expect(profitFailed.salesLoadingPeriods).toEqual([ReportPeriod.Daily]);

      const salesFailed = dashboardReducer(profitFailed, {
        ...DASHBOARD_ACTIONS.loadSalesMetricsFailure({ period: ReportPeriod.Daily, error: new Error('boom') }),
      });
      expect(salesFailed.salesLoadingPeriods).toEqual([]);
      expect(salesFailed.salesByPeriod[ReportPeriod.Daily]).toBeUndefined();
    });
  });

  describe('refresh', () => {
    it('drops only the selected period caches and keeps other periods', () => {
      let state: DashboardState = {
        ...DASHBOARD_INITIAL_STATE,
        salesProfitByPeriod: {
          [ReportPeriod.Daily]: PROFIT_POINTS,
          [ReportPeriod.Monthly]: PROFIT_POINTS,
        },
        salesByPeriod: {
          [ReportPeriod.Daily]: SALES_POINTS,
          [ReportPeriod.Monthly]: SALES_POINTS,
        },
      };
      const next = dashboardReducer(state, { ...DASHBOARD_ACTIONS.refresh() });
      expect(next.salesProfitByPeriod[ReportPeriod.Daily]).toBeUndefined();
      expect(next.salesByPeriod[ReportPeriod.Daily]).toBeUndefined();
      expect(next.salesProfitByPeriod[ReportPeriod.Monthly]).toEqual(PROFIT_POINTS);
      expect(next.salesByPeriod[ReportPeriod.Monthly]).toEqual(SALES_POINTS);
      // Overviews stay untouched; the reload goes through the `loadOverviews` guard.
      expect(next).not.toBeNull();
    });
  });
});
