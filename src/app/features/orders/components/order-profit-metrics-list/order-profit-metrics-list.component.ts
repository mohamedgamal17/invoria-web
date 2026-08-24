import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';

import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { SurfaceCardComponent } from '../../../../shared/ui/surface-card/surface-card.component';
import type { OrderSalesProfitReportPeriod } from '../../models/order-report.entity';
import { ReportPeriod } from '../../../../shared/models/report-period';
import { formatPeriodLabel } from '../../../../shared/charts/echarts-presets';

@Component({
  selector: 'app-order-profit-metrics-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, PaginatorModule, SkeletonModule, EmptyStateComponent, SurfaceCardComponent],
  templateUrl: './order-profit-metrics-list.component.html'
})
export class OrderProfitMetricsListComponent {
  readonly ReportPeriod = ReportPeriod;

  rows = input<OrderSalesProfitReportPeriod[]>([]);
  totalRecords = input(0);
  first = input(0);
  pageSize = input(10);
  pageSizeOptions = input([5, 10, 20]);
  loading = input(false);
  selectedPeriod = input<ReportPeriod>(ReportPeriod.Daily);

  pageChange = output<any>();
  clearFilters = output<void>();

  get skeletonRows(): number[] {
    return Array.from({ length: this.pageSize() }, (_, i) => i);
  }

  formatPeriod(dateIso: string): string {
    return formatPeriodLabel(dateIso, this.selectedPeriod());
  }
}
