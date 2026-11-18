import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, ActivatedRoute } from '@angular/router';
import { catchError, of } from 'rxjs';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';

import { ChartCardComponent } from '../../../../shared/ui/chart-card/chart-card.component';
import { formatCurrency, formatNumber } from '../../../../shared/utils/format';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { KpiCardComponent } from '../../../../shared/ui/kpi-card/kpi-card.component';
import { PurchaseOrdersApiService } from '../../services/purchase-orders-api.service';
import {
  REPORT_SERIES_PERIOD_OPTIONS,
  ReportPeriod
} from '../../../../shared/models/report-period';
import type { ReportOverview } from '../../../../shared/models/report-overview';
import type { PurchaseCompletionReportPeriod } from '../../models/purchase-order-report.entity';
import { ECHARTS_PALETTE, formatPeriodLabel } from '../../../../shared/charts/echarts-presets';
import type { EChartsCoreOption } from 'echarts/core';
import { presentApiError } from '../../../../core/http/api-error.presenter';
import { Calendar, CalendarRange, CheckCircle2, Clock, PackageCheck } from 'lucide-angular';

@Component({
  selector: 'app-purchase-completion-report-page',
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
  templateUrl: './purchase-completion-report-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PurchaseCompletionReportPageComponent implements OnInit {
  private readonly purchaseOrdersApi = inject(PurchaseOrdersApiService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly ReportPeriod = ReportPeriod;
  readonly periodOptions = REPORT_SERIES_PERIOD_OPTIONS;

  // Icons — completion semantics
  readonly allTimeIcon = PackageCheck;
  readonly todayCountIcon = CheckCircle2;
  readonly growthIcon = CheckCircle2;

  readonly todayIcon = Calendar;
  readonly monthIcon = CalendarRange;
  readonly yearIcon = Clock;

  readonly selectedPeriod = signal<ReportPeriod>(ReportPeriod.Daily);

  readonly isOverviewLoading = signal(true);

  private readonly metricsCache = signal<Map<ReportPeriod, PurchaseCompletionReportPeriod[]>>(new Map());
  private readonly metricsLoadingSet = signal<Set<ReportPeriod>>(new Set());

  readonly isMetricsLoading = computed(() => this.metricsLoadingSet().has(this.selectedPeriod()));
  readonly overview = signal<ReportOverview<PurchaseCompletionReportPeriod> | null>(null);
  readonly series = computed<PurchaseCompletionReportPeriod[]>(() => this.metricsCache().get(this.selectedPeriod()) ?? []);

  readonly kpiAllTimeCount = computed(() => this.overview()?.allTime.totalCount ?? null);
  readonly kpiTodayCount = computed(() => this.overview()?.thisDay.totalCount ?? null);
  readonly kpiMonthCount = computed(() => this.overview()?.thisMonth.totalCount ?? null);
  readonly kpiYearCount = computed(() => this.overview()?.thisYear.totalCount ?? null);

  readonly chartOptions = computed<EChartsCoreOption | null>(() => {
    const data = this.series();
    if (!data.length) return null;
    const chronological = [...data].reverse();
    const period = this.selectedPeriod();
    const labels = chronological.map((point) => formatPeriodLabel(point.date, period));
    return {
      tooltip: { trigger: 'axis' },
      legend: { data: ['Completed orders'], bottom: 0, textStyle: { fontSize: 11 } },
      grid: { left: 16, right: 16, top: 16, bottom: 36, containLabel: true },
      xAxis: {
        type: 'category',
        data: labels,
        boundaryGap: true,
        axisLabel: { fontSize: 10, rotate: 18 }
      },
      yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
      series: [
        {
          name: 'Completed orders',
          type: 'bar',
          barMaxWidth: 32,
          itemStyle: { borderRadius: [6, 6, 0, 0] },
          data: chronological.map((point) => point.totalCount)
        }
      ],
      color: [ECHARTS_PALETTE.success]
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

  readonly formatNumber = formatNumber;

  private loadOverview(): void {
    this.isOverviewLoading.set(true);
    this.purchaseOrdersApi
      .getPurchaseCompletionReportOverview()
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
            this.overview.set(response.result);
          }
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

    this.purchaseOrdersApi
      .listPurchaseCompletionReportMetrics(metricsRequest)
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

  private handleError(error: unknown): void {
    const presentation = presentApiError(error);
    this.messageService.add(presentation.toast);
  }
}
