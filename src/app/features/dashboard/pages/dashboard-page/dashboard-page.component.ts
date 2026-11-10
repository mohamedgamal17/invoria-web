import { Component, computed, inject, OnInit } from '@angular/core';

import { Store } from '@ngrx/store';

import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';

import { KpiCardComponent } from '../../components/kpi-card/kpi-card.component';
import { ReportChartComponent } from '../../components/report-chart/report-chart.component';

import { DASHBOARD_ACTIONS } from '../../store/dashboard/dashboard.actions';
import { dashboardSelectors } from '../../store/dashboard/dashboard.selectors';

import {
  REPORT_PERIOD_LABELS,
  REPORT_SERIES_PERIODS,
  ReportPeriod
} from '../../../../shared/models/report-period';
import type { EChartsCoreOption } from 'echarts/core';
import { ECHARTS_COLORS } from '../../../../shared/charts/echarts-presets';

import {
  ClipboardCheck,
  DollarSign,
  Package,
  Receipt,
  TrendingUp,
  Users,
  Wallet,
  Warehouse
} from 'lucide-angular';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    KpiCardComponent,
    ReportChartComponent,
    ToastModule,
    SkeletonModule,
    ButtonModule
  ],
  templateUrl: './dashboard-page.component.html'
})
export class DashboardPageComponent implements OnInit {
  private readonly store = inject(Store);

  readonly periodOptions = REPORT_SERIES_PERIODS.map((periodValue) => ({
    label: REPORT_PERIOD_LABELS[periodValue],
    value: periodValue
  }));

  // Icons for modern KPI cards
  readonly customersIcon = Users;
  readonly productsIcon = Package;
  readonly suppliersIcon = Warehouse;
  readonly completedOrdersIcon = ClipboardCheck;
  readonly orderSalesIcon = DollarSign;
  readonly profitIcon = TrendingUp;
  readonly purchaseSalesIcon = Receipt;
  readonly revenueIcon = Wallet;

  // --- Dashboard store (overviews + per-period metrics caches) ---
  readonly selectedPeriod = this.store.selectSignal(dashboardSelectors.selectSelectedPeriod);
  readonly isOverviewLoading = this.store.selectSignal(dashboardSelectors.selectIsOverviewLoading);

  readonly customerOverview = this.store.selectSignal(dashboardSelectors.selectCustomerOverview);
  readonly productOverview = this.store.selectSignal(dashboardSelectors.selectProductOverview);
  readonly supplierOverview = this.store.selectSignal(dashboardSelectors.selectSupplierOverview);
  readonly orderSalesOverview = this.store.selectSignal(dashboardSelectors.selectOrderSalesOverview);
  readonly orderProfitOverview = this.store.selectSignal(dashboardSelectors.selectOrderProfitOverview);
  readonly orderCompletionOverview = this.store.selectSignal(dashboardSelectors.selectOrderCompletionOverview);
  readonly purchaseSalesOverview = this.store.selectSignal(dashboardSelectors.selectPurchaseSalesOverview);

  readonly salesProfitSeries = this.store.selectSignal(dashboardSelectors.selectSalesProfitSeries);
  readonly salesSeries = this.store.selectSignal(dashboardSelectors.selectSalesSeries);
  readonly isMetricsLoading = this.store.selectSignal(dashboardSelectors.selectIsMetricsLoading);

  // KPI helpers
  kpiCustomersAll = computed(() => this.customerOverview()?.allTime.totalCount ?? null);
  kpiProductsAll = computed(() => this.productOverview()?.allTime.totalCount ?? null);
  kpiSuppliersAll = computed(() => this.supplierOverview()?.allTime.totalCount ?? null);
  kpiOrdersCompletedAll = computed(() => this.orderCompletionOverview()?.allTime.totalCount ?? null);
  kpiSalesAmountAll = computed(() => this.orderSalesOverview()?.allTime.totalAmount ?? null);
  kpiProfitAll = computed(() => this.orderProfitOverview()?.allTime.totalProfit ?? null);
  kpiPurchaseAmountAll = computed(() => this.purchaseSalesOverview()?.allTime.totalAmount ?? null);
  kpiRevenueAll = computed(() => this.orderProfitOverview()?.allTime.totalRevenue ?? null);

  // ECharts options
  readonly profitChartOptions = computed<EChartsCoreOption | null>(() => {
    const data = this.salesProfitSeries();
    if (!data.length) return null;
    const chronological = [...data].reverse();
    const labels = chronological.map((point) => this.formatDateLabel(point.date));
    return {
      tooltip: { trigger: 'axis' },
      legend: { data: ['Revenue', 'Cost', 'Profit'], bottom: 0, textStyle: { fontSize: 11 } },
      grid: { left: 16, right: 16, top: 24, bottom: 32, containLabel: true },
      xAxis: { type: 'category', data: labels, boundaryGap: false, axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
      series: [
        {
          name: 'Revenue',
          type: 'line',
          smooth: true,
          areaStyle: { opacity: 0.15 },
          lineStyle: { width: 2 },
          data: chronological.map((point) => point.totalRevenue)
        },
        {
          name: 'Cost',
          type: 'line',
          smooth: true,
          areaStyle: { opacity: 0.08 },
          lineStyle: { width: 2 },
          data: chronological.map((point) => point.totalCost)
        },
        {
          name: 'Profit',
          type: 'line',
          smooth: true,
          areaStyle: { opacity: 0.18 },
          lineStyle: { width: 2.5 },
          emphasis: { focus: 'series' },
          data: chronological.map((point) => point.totalProfit)
        }
      ],
      color: [...ECHARTS_COLORS.revenueCostProfit]
    };
  });

  readonly salesChartOptions = computed<EChartsCoreOption | null>(() => {
    const data = this.salesSeries();
    if (!data.length) return null;
    const chronological = [...data].reverse();
    const labels = chronological.map((point) => this.formatDateLabel(point.date));
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: 16, right: 16, top: 16, bottom: 24, containLabel: true },
      xAxis: { type: 'category', data: labels, axisLabel: { fontSize: 10, rotate: 18 } },
      yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
      series: [
        {
          name: 'Sales',
          type: 'bar',
          barMaxWidth: 28,
          itemStyle: { borderRadius: [6, 6, 0, 0] },
          data: chronological.map((point) => point.totalAmount)
        },
        {
          name: 'Returns',
          type: 'bar',
          barMaxWidth: 28,
          itemStyle: { borderRadius: [6, 6, 0, 0], opacity: 0.55 },
          data: chronological.map((point) => point.totalReturnAmount)
        }
      ],
      color: [...ECHARTS_COLORS.salesReturns]
    };
  });

  ngOnInit(): void {
    this.store.dispatch(DASHBOARD_ACTIONS.loadOverviews());
    // The store defaults to `Daily`; trigger the metrics load for the initial period directly.
    this.store.dispatch(DASHBOARD_ACTIONS.loadMetrics());
  }

  onPeriodChange(period: ReportPeriod): void {
    this.store.dispatch(DASHBOARD_ACTIONS.selectPeriod({ period }));
  }

  refresh(): void {
    this.store.dispatch(DASHBOARD_ACTIONS.refresh());
  }

  formatCurrency(value: number | null): string {
    if (value == null) return '—';
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  }

  formatNumber(value: number | null): string {
    if (value == null) return '—';
    return new Intl.NumberFormat().format(value);
  }

  private formatDateLabel(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
    const period = this.selectedPeriod();
    if (period === ReportPeriod.Monthly) {
      return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    }
    if (period === ReportPeriod.Yearly) {
      return date.getFullYear().toString();
    }
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
}
