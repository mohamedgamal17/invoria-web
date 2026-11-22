import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

import {
  REPORT_SERIES_PERIOD_OPTIONS,
  ReportPeriod,
  type ReportPeriodFilters,
} from '@invoria/utils';
import { SurfaceCardComponent } from '../surface-card/surface-card.component';

/** Period filter shared by every metrics/report page. */
@Component({
  selector: 'app-report-period-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, SelectModule, SurfaceCardComponent],
  templateUrl: './report-period-filter-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportPeriodFilterPanelComponent {
  period = input<ReportPeriod>(ReportPeriod.Daily);
  loading = input(false);
  inputId = input('report-period-filter');

  filtersChange = output<ReportPeriodFilters>();
  clearFilters = output<void>();

  readonly periodOptions = REPORT_SERIES_PERIOD_OPTIONS;

  onPeriodChange(value: ReportPeriod | null | undefined): void {
    if (value === null || value === undefined) {
      return;
    }
    this.filtersChange.emit({ period: value });
  }

  onClear(): void {
    this.clearFilters.emit();
  }
}
