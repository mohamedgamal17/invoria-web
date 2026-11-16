import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

import { SurfaceCardComponent } from '../../../../shared/ui/surface-card/surface-card.component';
import { REPORT_SERIES_PERIOD_OPTIONS, ReportPeriod } from '../../../../shared/models/report-period';

export type SalesMetricsFilters = {
  period: ReportPeriod;
};

@Component({
  selector: 'app-order-sales-metrics-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, SelectModule, SurfaceCardComponent],
  templateUrl: './order-sales-metrics-filter-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderSalesMetricsFilterPanelComponent {
  period = input<ReportPeriod>(ReportPeriod.Daily);
  loading = input(false);

  filtersChange = output<SalesMetricsFilters>();
  clearFilters = output<void>();

  readonly ReportPeriod = ReportPeriod;
  readonly periodOptions = REPORT_SERIES_PERIOD_OPTIONS;

  onPeriodChange(value: ReportPeriod | null | undefined): void {
    if (value == null) return;
    this.filtersChange.emit({ period: value });
  }

  onClear(): void {
    this.clearFilters.emit();
  }
}
