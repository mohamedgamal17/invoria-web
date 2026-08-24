import { CommonModule } from '@angular/common';
import { Component, computed, inject, linkedSignal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';

import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { PurchaseOrdersApiService } from '../../services/purchase-orders-api.service';
import { REPORT_SERIES_PERIODS, ReportPeriod } from '../../../../shared/models/report-period';
import type { PurchaseSalesReportPeriod } from '../../models/purchase-order-report.entity';
import type { ListPurchaseSalesReportRequest } from '../../models/list-purchase-order-report.request';
import type { PagingInfo } from '../../../../core/models/paging';
import { presentApiError } from '../../../../core/http/api-error.presenter';
import {
  PurchaseSalesMetricsFilterPanelComponent,
  type PurchaseSalesMetricsFilters
} from '../../components/purchase-sales-metrics-filter-panel/purchase-sales-metrics-filter-panel.component';
import { PurchaseSalesMetricsListComponent } from '../../components/purchase-sales-metrics-list/purchase-sales-metrics-list.component';

const EMPTY_SALES_TUPLE: [PurchaseSalesReportPeriod[], PagingInfo] = [
  [],
  { length: 0, skip: 0, totalCount: 0 }
];

const REPORT_PERIOD_VALUES = Object.values(ReportPeriod).filter((v): v is number => typeof v === 'number');

function parsePeriodParam(raw: string | null): ReportPeriod | null {
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return REPORT_PERIOD_VALUES.includes(n) && REPORT_SERIES_PERIODS.includes(n as ReportPeriod) ? (n as ReportPeriod) : null;
}

@Component({
  selector: 'app-purchase-sales-metrics-page',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    ButtonModule,
    PageHeaderComponent,
    PurchaseSalesMetricsFilterPanelComponent,
    PurchaseSalesMetricsListComponent
  ],
  providers: [MessageService],
  templateUrl: './purchase-sales-metrics-page.component.html'
})
export class PurchaseSalesMetricsPageComponent {
  readonly pageSizeOptions = [25, 50, 100, 200];

  private readonly purchaseOrdersApi = inject(PurchaseOrdersApiService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly ReportPeriod = ReportPeriod;

  // --- URL derived state ---
  private readonly periodFromRoute = toSignal(
    this.route.queryParamMap.pipe(
      map((m) => parsePeriodParam(m.get('period')) ?? ReportPeriod.Daily)
    ),
    { initialValue: ReportPeriod.Daily }
  );

  readonly selectedPeriod = computed(() => this.periodFromRoute());

  private readonly pageFromRoute = toSignal(
    this.route.queryParamMap.pipe(
      map((m) => {
        const raw = m.get('page');
        const n = raw ? parseInt(raw, 10) : 1;
        return Number.isFinite(n) && n >= 1 ? n : 1;
      })
    ),
    { initialValue: 1 }
  );

  readonly pageSize = toSignal(
    this.route.queryParamMap.pipe(
      map((m) => {
        const raw = m.get('pageSize');
        const n = raw ? parseInt(raw, 10) : NaN;
        return this.pageSizeOptions.includes(n) ? n : 25;
      })
    ),
    { initialValue: 25 }
  );

  readonly pageIndex = computed(() => Math.max(0, this.pageFromRoute() - 1));
  readonly first = computed(() => this.pageIndex() * this.pageSize());

  readonly listRequest = computed(
    (): ListPurchaseSalesReportRequest => ({
      Period: this.selectedPeriod(),
      Skip: this.pageIndex() * this.pageSize(),
      Length: this.pageSize()
    })
  );

  // --- Data ---
  readonly metricsResource = rxResource<[PurchaseSalesReportPeriod[], PagingInfo], ListPurchaseSalesReportRequest>({
    params: () => this.listRequest(),
    defaultValue: EMPTY_SALES_TUPLE,
    stream: ({ params }) =>
      this.purchaseOrdersApi.listPurchaseSalesReportMetrics(params).pipe(
        map((res) => {
          if (!res.isSuccess || !res.result) {
            this.showApiError(res.error);
            return EMPTY_SALES_TUPLE;
          }
          return [res.result.data, res.result.info] as [PurchaseSalesReportPeriod[], PagingInfo];
        }),
        catchError((err: unknown) => {
          this.showApiError(err);
          return of(EMPTY_SALES_TUPLE);
        })
      )
  });

  readonly displayRows = linkedSignal({
    source: () => this.metricsLinkSource(),
    computation: (src) => [...src.rows]
  });

  readonly displayPaging = linkedSignal({
    source: () => this.metricsLinkSource(),
    computation: (src) => ({ ...src.paging })
  });

  onFiltersChange(filters: PurchaseSalesMetricsFilters): void {
    if (filters.period === this.selectedPeriod()) return;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { period: filters.period, page: 1 },
      queryParamsHandling: 'merge'
    });
  }

  onClearFilters(): void {
    if (this.selectedPeriod() === ReportPeriod.Daily) return;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { period: ReportPeriod.Daily, page: 1 },
      queryParamsHandling: 'merge'
    });
  }

  onPageChange(event: { first?: number; rows?: number; page?: number }): void {
    const firstEvt = event.first ?? 0;
    const rows = event.rows ?? this.pageSize();
    const newPageIndex = event.page !== undefined ? event.page : Math.floor(firstEvt / Math.max(rows, 1));

    if (this.pageIndex() !== newPageIndex || this.pageSize() !== rows) {
      const isManualPageChange = this.pageIndex() !== newPageIndex;
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { page: newPageIndex + 1, pageSize: rows },
        queryParamsHandling: 'merge'
      });
      if (isManualPageChange) window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToCharts(): void {
    void this.router.navigate(['../'], {
      relativeTo: this.route,
      queryParams: { period: this.selectedPeriod() },
      queryParamsHandling: 'merge'
    });
  }

  private metricsLinkSource(): { request: ListPurchaseSalesReportRequest; rows: PurchaseSalesReportPeriod[]; paging: PagingInfo } {
    const [rows, paging] = this.metricsResource.value();
    return { request: this.listRequest(), rows, paging };
  }

  private showApiError(error: unknown): void {
    const presentation = presentApiError(error);
    this.messageService.add(presentation.toast);
    if (presentation.routeTarget) void this.router.navigate([presentation.routeTarget]);
  }
}
