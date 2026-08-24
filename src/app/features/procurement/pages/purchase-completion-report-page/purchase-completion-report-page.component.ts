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
import { PurchaseOrdersApiService } from '../../services/purchase-orders-api.service';
import {
  REPORT_PERIOD_LABELS,
  REPORT_SERIES_PERIODS,
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
  templateUrl: './purchase-completion-report-page.component.html'
})
export class PurchaseCompletionReportPageComponent implements OnInit {
  private readonly purchaseOrdersApi = inject(PurchaseOrdersApiService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly ReportPeriod = ReportPeriod;
  readonly periodOptions = REPORT_SERIES_PERIODS.map((v) => ({
    label: REPORT_PERIOD_LABELS[v],
    value: v
  }));

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
    const labels = chronological.map((d) => formatPeriodLabel(d.date, period));
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
          data: chronological.map((d) => d.totalCount)
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

  formatNumber(value: number | null): string {
    if (value == null) return '—';
    return new Intl.NumberFormat().format(value);
  }

  private loadOverview(): void {
    this.isOverviewLoading.set(true);
    this.purchaseOrdersApi.getPurchaseCompletionReportOverview().pipe(catchError((e) => {
      this.handleError(e);
      return of(null);
    })).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.result) {
          this.overview.set(res.result);
        }
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

    this.purchaseOrdersApi.listPurchaseCompletionReportMetrics(req).pipe(catchError((e) => {
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

  private handleError(error: unknown): void {
    const presentation = presentApiError(error);
    this.messageService.add(presentation.toast);
  }
}
