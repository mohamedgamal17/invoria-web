import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

import { SurfaceCardComponent } from '../../../../shared/ui/surface-card/surface-card.component';
import { REPORT_PERIOD_LABELS, REPORT_SERIES_PERIODS, ReportPeriod } from '../../../../shared/models/report-period';

export type SalesMetricsFilters = {
  period: ReportPeriod;
};

@Component({
  selector: 'app-order-sales-metrics-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, SelectModule, SurfaceCardComponent],
  templateUrl: './order-sales-metrics-filter-panel.component.html'
})
export class OrderSalesMetricsFilterPanelComponent {
  period = input<ReportPeriod>(ReportPeriod.Daily);
  loading = input(false);

  filtersChange = output<SalesMetricsFilters>();
  clearFilters = output<void>();

  readonly ReportPeriod = ReportPeriod;

  readonly periodOptions = REPORT_SERIES_PERIODS.map((v) => ({
    label: REPORT_PERIOD_LABELS[v],
    value: v
  }));

  onPeriodChange(value: ReportPeriod | null | undefined): void {
    if (value == null) return;
    this.filtersChange.emit({ period: value });
  }

  onClear(): void {
    this.clearFilters.emit();
  }
}
