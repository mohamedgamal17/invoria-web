import { Component, input } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsCoreOption } from 'echarts/core';
import { SkeletonModule } from 'primeng/skeleton';

/**
 * Canonical ECharts wrapper for the app.
 * Prefer this over raw <div echarts> or PrimeNG Chart.
 * Smart pages compute `EChartsCoreOption` via `computed()` and pass via [options].
 * See `ai/charts.md` for the full convention.
 */
@Component({
  selector: 'app-chart-card',
  standalone: true,
  imports: [NgxEchartsDirective, SkeletonModule],
  templateUrl: './chart-card.component.html'
})
export class ChartCardComponent {
  title = input.required<string>();
  subtitle = input<string>('');
  options = input<EChartsCoreOption | null>(null);
  loading = input(false);
  heightClass = input('h-72');
}
