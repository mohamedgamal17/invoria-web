import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, ActivatedRoute } from '@angular/router';
import { catchError, of } from 'rxjs';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';

import { ChartCardComponent } from '@invoria/ui';
import { formatCurrency, formatNumber } from '@invoria/utils';
import { PageHeaderComponent } from '@invoria/ui';
import { KpiCardComponent } from '@invoria/ui';
import { OrdersApiService } from '@invoria/sales/orders/services/orders-api.service';
import {
  REPORT_SERIES_PERIOD_OPTIONS,
  ReportPeriod
} from '@invoria/utils';
import type { ReportOverview } from '@invoria/utils';
import type { OrderSalesProfitReportPeriod } from '@invoria/sales/orders/models/order-report.entity';
import { ECHARTS_PALETTE, formatPeriodLabel } from '@invoria/utils';
import type { EChartsCoreOption } from 'echarts/core';
import { presentApiError } from '@invoria/core';
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
  templateUrl: './order-profit-report-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderProfitReportPageComponent implements OnInit {
  private readonly ordersApi = inject(OrdersApiService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly ReportPeriod = ReportPeriod;
  readonly periodOptions = REPORT_SERIES_PERIOD_OPTIONS;

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

  // Per-period metrics cache — mirrors order-sales-report-page, per docs/architecture/overview.md
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
    const labels = chronological.map((point) => formatPeriodLabel(point.date, period));
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
    this.metricsCache.update((current) => {
      const next = new Map(current);
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

  readonly formatCurrency = formatCurrency;

  readonly formatNumber = formatNumber;

  private loadOverview(): void {
    this.isOverviewLoading.set(true);
    this.ordersApi
      .getOrderSalesProfitReportOverview()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error) => {
          this.handleError(error);
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          if (response?.isSuccess && response.result) this.overview.set(response.result);
          this.isOverviewLoading.set(false);
        },
        error: (error) => {
          this.handleError(error);
          this.isOverviewLoading.set(false);
        }
      });
  }

  private ensureMetrics(period: ReportPeriod): void {
    if (this.metricsCache().has(period)) return;
    if (this.metricsLoadingSet().has(period)) return;

    this.metricsLoadingSet.update((current) => new Set(current).add(period));
    const metricsRequest = { period: period, skip: 0, length: 14 } as const;
    this.ordersApi
      .listOrderSalesProfitReportMetrics(metricsRequest)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error) => {
          this.handleError(error);
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          if (response?.isSuccess && response.result) {
            const copy = [...(response.result.data ?? [])];
            this.metricsCache.update((current) => new Map(current).set(period, copy));
          } else {
            if (response && !response.isSuccess) this.handleError(response.error);
          }
          this.metricsLoadingSet.update((current) => {
            const next = new Set(current);
            next.delete(period);
            return next;
          });
        },
        error: (error) => {
          this.handleError(error);
          this.metricsLoadingSet.update((current) => {
            const next = new Set(current);
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
