import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';

import { EmptyStateComponent } from '@invoria/ui';
import { SurfaceCardComponent } from '@invoria/ui';
import {
  COMPACT_PAGE_SIZE_OPTIONS,
  type PaginatorPageEvent,
} from '@invoria/utils';
import type { PurchaseCompletionReportPeriod } from '@invoria/procurement/purchase-orders/models/purchase-order-report.entity';
import { ReportPeriod } from '@invoria/utils';
import { formatPeriodLabel } from '@invoria/utils';

@Component({
  selector: 'app-purchase-completion-metrics-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    PaginatorModule,
    SkeletonModule,
    EmptyStateComponent,
    SurfaceCardComponent,
  ],
  templateUrl: './purchase-completion-metrics-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseCompletionMetricsListComponent {
  readonly ReportPeriod = ReportPeriod;

  rows = input<PurchaseCompletionReportPeriod[]>([]);
  totalRecords = input(0);
  first = input(0);
  pageSize = input(10);
  pageSizeOptions = input(COMPACT_PAGE_SIZE_OPTIONS);
  loading = input(false);
  selectedPeriod = input<ReportPeriod>(ReportPeriod.Daily);

  pageChange = output<PaginatorPageEvent>();
  clearFilters = output<void>();

  readonly skeletonRows = computed(() =>
    Array.from({ length: this.pageSize() }, (_, index) => index),
  );

  formatPeriod(dateIso: string): string {
    return formatPeriodLabel(dateIso, this.selectedPeriod());
  }
}
