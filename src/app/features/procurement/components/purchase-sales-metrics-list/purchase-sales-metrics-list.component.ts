import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';

import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { SurfaceCardComponent } from '../../../../shared/ui/surface-card/surface-card.component';
import { type PaginatorPageEvent } from '../../../../shared/models/pagination';
import type { PurchaseSalesReportPeriod } from '../../models/purchase-order-report.entity';
import { ReportPeriod } from '../../../../shared/models/report-period';
import { formatPeriodLabel } from '../../../../shared/charts/echarts-presets';
import { DEFAULT_CURRENCY_CODE } from '../../../../shared/models/currency';

@Component({
  selector: 'app-purchase-sales-metrics-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, PaginatorModule, SkeletonModule, EmptyStateComponent, SurfaceCardComponent],
  templateUrl: './purchase-sales-metrics-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PurchaseSalesMetricsListComponent {
  protected readonly currencyCode = signal(DEFAULT_CURRENCY_CODE);
  readonly ReportPeriod = ReportPeriod;

  rows = input<PurchaseSalesReportPeriod[]>([]);
  totalRecords = input(0);
  first = input(0);
  pageSize = input(10);
  pageSizeOptions = input([5, 10, 20]);
  loading = input(false);
  selectedPeriod = input<ReportPeriod>(ReportPeriod.Daily);

  pageChange = output<PaginatorPageEvent>();
  clearFilters = output<void>();

  readonly skeletonRows = computed(() =>
    Array.from({ length: this.pageSize() }, (_, index) => index)
  );

  formatPeriod(dateIso: string): string {
    return formatPeriodLabel(dateIso, this.selectedPeriod());
  }
}
