import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { catchError, of } from 'rxjs';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';

import { ChartCardComponent } from '../../../../shared/ui/chart-card/chart-card.component';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { KpiCardComponent } from '../../../dashboard/components/kpi-card/kpi-card.component';
import { OrdersApiService } from '../../services/orders-api.service';
import {
  REPORT_PERIOD_LABELS,
  REPORT_SERIES_PERIODS,
  ReportPeriod
} from '../../../../shared/models/report-period';
import type { ReportOverview } from '../../../../shared/models/report-overview';
import type { OrderSalesProfitReportPeriod } from '../../models/order-report.entity';
import { ECHARTS_PALETTE, formatPeriodLabel } from '../../../../shared/charts/echarts-presets';
import type { EChartsCoreOption } from 'echarts/core';
import { presentApiError } from '../../../../core/http/api-error.presenter';
import { Calendar, CalendarRange, Clock, DollarSign, TrendingDown, TrendingUp, Wallet } from 'lucide-angular';

@Component({
  selector: 'app-order-profit-report-page',
  standalone: true,
  imports: [
    ToastModule,
    SkeletonModule,
    ButtonModule,
    ChartCardComponent,
    PageHeaderComponent,
    KpiCardComponent
  ],
  providers: [MessageService],
  templateUrl: './order-profit-report-page.component.html'
})
export class OrderProfitReportPageComponent implements OnInit {
  private readonly ordersApi = inject(OrdersApiService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly ReportPeriod = ReportPeriod;
  readonly periodOptions = REPORT_SERIES_PERIODS.map((v) => ({
    label: REPORT_PERIOD_LABELS[v],
    value: v
  }));

  readonly profitIcon = TrendingUp;
  readonly revenueIcon = DollarSign;
  readonly costIcon = Wallet;
  readonly returnsIcon = TrendingDown;

  // Hints section icons — temporal distinction
  readonly todayIcon = Calendar;
  readonly monthIcon = CalendarRange;
  readonly yearIcon = Clock;

  readonly selectedPeriod = signal<ReportPeriod>(ReportPeriod.Daily);

  readonly isOverviewLoading = signal(true);

  // Per-period metrics cache — mirrors order-sales-report-page, per ARCHITECTURE.md:70
  private readonly metricsCache = signal<Map<ReportPeriod, OrderSalesProfitReportPeriod[]>>(new Map());
  private readonly metricsLoadingSet = signal<Set<ReportPeriod>>(new Set());

  readonly isMetricsLoading = computed(() => this.metricsLoadingSet().has(this.selectedPeriod()));
  readonly overview = signal<ReportOverview<OrderSalesProfitReportPeriod> | null>(null);
  readonly series = computed<OrderSalesProfitReportPeriod[]>(() => this.metricsCache().get(this.selectedPeriod()) ?? []);

  readonly kpiAllTimeProfit = computed(() => this.overview()?.allTime.totalProfit ?? null);
  readonly kpiAllTimeRevenue = computed(() => this.overview()?.allTime.totalRevenue ?? null);
  readonly kpiAllTimeCost = computed(() => this.overview()?.allTime.totalCost ?? null);
  readonly kpiAllTimeReturns = computed(() => this.overview()?.allTime.totalReturnAmount ?? null);

  readonly chartOptions = computed<EChartsCoreOption | null>(() => {
    const data = this.series();
    if (!data.length) return null;
    const chronological = [...data].reverse();
    const period = this.selectedPeriod();
    const labels = chronological.map((d) => formatPeriodLabel(d.date, period));
    return {
      tooltip: { trigger: 'axis' },
      legend: { data: ['Revenue', 'Cost', 'Profit'], bottom: 0, textStyle: { fontSize: 11 } },
      grid: { left: 16, right: 16, top: 24, bottom: 36, containLabel: true },
      xAxis: { type: 'category', data: labels, boundaryGap: false, axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
      series: [
        {
          name: 'Revenue',
          type: 'line',
          smooth: true,
          areaStyle: { opacity: 0.15 },
          lineStyle: { width: 2 },
          data: chronological.map((d) => d.totalRevenue)
        },
        {
          name: 'Cost',
          type: 'line',
          smooth: true,
          areaStyle: { opacity: 0.08 },
          lineStyle: { width: 2 },
          data: chronological.map((d) => d.totalCost)
        },
        {
          name: 'Profit',
          type: 'line',
          smooth: true,
          areaStyle: { opacity: 0.18 },
          lineStyle: { width: 2.5 },
          emphasis: { focus: 'series' },
          data: chronological.map((d) => d.totalProfit)
        }
      ],
      color: [ECHARTS_PALETTE.primary, ECHARTS_PALETTE.warning, ECHARTS_PALETTE.success]
    };
  });

  ngOnInit(): void {
    this.loadOverview();
    this.ensureMetrics(this.selectedPeriod());
  }

  onPeriodChange(period: ReportPeriod): void {
    const prev = this.selectedPeriod();
    if (prev === period && this.metricsCache().has(period)) return;
    this.selectedPeriod.set(period);
    this.ensureMetrics(period);
  }

  refresh(): void {
    this.loadOverview();
    this.metricsCache.update((m) => {
      const next = new Map(m);
      next.delete(this.selectedPeriod());
      return next;
    });
    this.ensureMetrics(this.selectedPeriod());
  }

  goToMetrics(): void {
    void this.router.navigate(['metrics'], {
      relativeTo: this.route,
      queryParams: { period: this.selectedPeriod() },
      queryParamsHandling: 'merge'
    });
  }

  formatCurrency(value: number | null): string {
    if (value == null) return '—';
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  }

  formatNumber(value: number | null): string {
    if (value == null) return '—';
    return new Intl.NumberFormat().format(value);
  }

  private loadOverview(): void {
    this.isOverviewLoading.set(true);
    this.ordersApi.getOrderSalesProfitReportOverview().pipe(catchError((e) => {
      this.handleError(e);
      return of(null);
    })).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.result) this.overview.set(res.result);
        this.isOverviewLoading.set(false);
      },
      error: (err) => {
        this.handleError(err);
        this.isOverviewLoading.set(false);
      }
    });
  }

  private ensureMetrics(period: ReportPeriod): void {
    if (this.metricsCache().has(period)) return;
    if (this.metricsLoadingSet().has(period)) return;

    this.metricsLoadingSet.update((s) => new Set(s).add(period));
    const req = { Period: period, Skip: 0, Length: 14 } as const;
    this.ordersApi.listOrderSalesProfitReportMetrics(req).pipe(catchError((e) => {
      this.handleError(e);
      return of(null);
    })).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.result) {
          const copy = [...(res.result.data ?? [])];
          this.metricsCache.update((m) => new Map(m).set(period, copy));
        } else {
          if (res && !res.isSuccess) this.handleError(res.error);
        }
        this.metricsLoadingSet.update((s) => {
          const next = new Set(s);
          next.delete(period);
          return next;
        });
      },
      error: (err) => {
        this.handleError(err);
        this.metricsLoadingSet.update((s) => {
          const next = new Set(s);
          next.delete(period);
          return next;
        });
      }
    });
  }

  private loadMetrics(period: ReportPeriod): void {
    this.ensureMetrics(period);
  }

  private handleError(error: unknown): void {
    const presentation = presentApiError(error);
    this.messageService.add(presentation.toast);
  }
}
