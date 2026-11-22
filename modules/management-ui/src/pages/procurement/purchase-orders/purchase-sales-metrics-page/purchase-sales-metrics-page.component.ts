import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';

import { PageHeaderComponent } from '@invoria/ui';
import { PurchaseOrdersApiService } from '@invoria/procurement/purchase-orders/services/purchase-orders-api.service';
import { REPORT_SERIES_PERIODS, ReportPeriod } from '@invoria/utils';
import type { PurchaseSalesReportPeriod } from '@invoria/procurement/purchase-orders/models/purchase-order-report.entity';
import type { ListPurchaseSalesReportRequest } from '@invoria/procurement/purchase-orders/models/list-purchase-order-report.request';
import type { PagingInfo } from '@invoria/core';
import { presentApiError } from '@invoria/core';
import { PaginationService } from '@invoria/utils';
import {
  COMPACT_PAGE_SIZE_OPTIONS,
  type PaginatorPageEvent,
} from '@invoria/utils';
import { ReportPeriodFilterPanelComponent } from '@invoria/ui';
import type { ReportPeriodFilters } from '@invoria/utils';
import { PurchaseSalesMetricsListComponent } from '@invoria/procurement/purchase-orders/components/purchase-sales-metrics-list/purchase-sales-metrics-list.component';

const EMPTY_SALES_TUPLE: [PurchaseSalesReportPeriod[], PagingInfo] = [
  [],
  { length: 0, skip: 0, totalCount: 0 },
];

const REPORT_PERIOD_VALUES = Object.values(ReportPeriod).filter(
  (value): value is number => typeof value === 'number',
);

function parsePeriodParam(raw: string | null): ReportPeriod | null {
  if (!raw) return null;
  const parsedPeriod = parseInt(raw, 10);
  return REPORT_PERIOD_VALUES.includes(parsedPeriod) &&
    REPORT_SERIES_PERIODS.includes(parsedPeriod as ReportPeriod)
    ? (parsedPeriod as ReportPeriod)
    : null;
}

@Component({
  selector: 'app-purchase-sales-metrics-page',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    ButtonModule,
    PageHeaderComponent,
    ReportPeriodFilterPanelComponent,
    PurchaseSalesMetricsListComponent,
  ],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './purchase-sales-metrics-page.component.html',
})
export class PurchaseSalesMetricsPageComponent {
  readonly pageSizeOptions = COMPACT_PAGE_SIZE_OPTIONS;

  private readonly pagination = inject(PaginationService);
  private readonly purchaseOrdersApi = inject(PurchaseOrdersApiService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly ReportPeriod = ReportPeriod;

  // --- URL derived state ---
  private readonly periodFromRoute = toSignal(
    this.route.queryParamMap.pipe(
      map((paramMap) => parsePeriodParam(paramMap.get('period')) ?? ReportPeriod.Daily),
    ),
    { initialValue: ReportPeriod.Daily },
  );

  readonly selectedPeriod = computed(() => this.periodFromRoute());

  private readonly pageFromRoute = toSignal(
    this.route.queryParamMap.pipe(
      map((paramMap) => {
        const raw = paramMap.get('page');
        const pageNumber = raw ? parseInt(raw, 10) : 1;
        return Number.isFinite(pageNumber) && pageNumber >= 1 ? pageNumber : 1;
      }),
    ),
    { initialValue: 1 },
  );

  readonly pageSize = toSignal(
    this.route.queryParamMap.pipe(
      map((paramMap) => this.pagination.pageSizeFromQuery(Number(paramMap.get('pageSize')))),
    ),
    { initialValue: 25 },
  );

  readonly pageIndex = computed(() => Math.max(0, this.pageFromRoute() - 1));
  readonly first = computed(() => this.pageIndex() * this.pageSize());

  readonly listRequest = computed(
    (): ListPurchaseSalesReportRequest => ({
      period: this.selectedPeriod(),
      skip: this.pageIndex() * this.pageSize(),
      length: this.pageSize(),
    }),
  );

  // --- Data ---
  readonly metricsResource = rxResource<
    [PurchaseSalesReportPeriod[], PagingInfo],
    ListPurchaseSalesReportRequest
  >({
    params: () => this.listRequest(),
    defaultValue: EMPTY_SALES_TUPLE,
    stream: ({ params }) =>
      this.purchaseOrdersApi.listPurchaseSalesReportMetrics(params).pipe(
        map((response) => {
          if (!response.isSuccess || !response.result) {
            this.showApiError(response.error);
            return EMPTY_SALES_TUPLE;
          }
          return [response.result.data, response.result.info] as [
            PurchaseSalesReportPeriod[],
            PagingInfo,
          ];
        }),
        catchError((error: unknown) => {
          this.showApiError(error);
          return of(EMPTY_SALES_TUPLE);
        }),
      ),
  });

  readonly displayRows = linkedSignal({
    source: () => this.metricsLinkSource(),
    computation: (source) => [...source.rows],
  });

  readonly displayPaging = linkedSignal({
    source: () => this.metricsLinkSource(),
    computation: (source) => ({ ...source.paging }),
  });

  onFiltersChange(filters: ReportPeriodFilters): void {
    if (filters.period === this.selectedPeriod()) return;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { period: filters.period, page: 1 },
      queryParamsHandling: 'merge',
    });
  }

  onClearFilters(): void {
    if (this.selectedPeriod() === ReportPeriod.Daily) return;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { period: ReportPeriod.Daily, page: 1 },
      queryParamsHandling: 'merge',
    });
  }

  onPageChange(event: PaginatorPageEvent): void {
    const firstEvt = event.first ?? 0;
    const rows = event.rows ?? this.pageSize();
    const newPageIndex =
      event.page !== undefined ? event.page : Math.floor(firstEvt / Math.max(rows, 1));

    if (this.pageIndex() !== newPageIndex || this.pageSize() !== rows) {
      const isManualPageChange = this.pageIndex() !== newPageIndex;
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { page: newPageIndex + 1, pageSize: rows },
        queryParamsHandling: 'merge',
      });
      if (isManualPageChange) window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToCharts(): void {
    void this.router.navigate(['../'], {
      relativeTo: this.route,
      queryParams: { period: this.selectedPeriod() },
      queryParamsHandling: 'merge',
    });
  }

  private metricsLinkSource(): {
    request: ListPurchaseSalesReportRequest;
    rows: PurchaseSalesReportPeriod[];
    paging: PagingInfo;
  } {
    const [rows, paging] = this.metricsResource.value();
    return { request: this.listRequest(), rows, paging };
  }

  private showApiError(error: unknown): void {
    const presentation = presentApiError(error);
    this.messageService.add(presentation.toast);
    if (presentation.routeTarget) void this.router.navigate([presentation.routeTarget]);
  }
}
