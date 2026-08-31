import { Component, computed, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsCoreOption } from 'echarts/core';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectButtonModule } from 'primeng/selectbutton';
import {
  REPORT_PERIOD_LABELS,
  REPORT_SERIES_PERIODS,
  ReportPeriod
} from '../../../shared/models/report-period';
import {
  generatePlaceholderCategoryLabels,
  resolvePlaceholderYInterval,
  resolvePlaceholderYMax,
  type PlaceholderYKind
} from '../../../shared/charts/chart-placeholder';
import { chartToken, echartsAxisColor, echartsGridColor, echartsLabelColor } from '../../../shared/charts/echarts-presets';
import { ThemeService } from '../../../core/theme/theme.service';

/**
 * Canonical ECharts wrapper for the app.
 * Prefer this over raw <div echarts> or PrimeNG Chart.
 * Smart pages compute `EChartsCoreOption` via `computed()` and pass via [options].
 * See `ai/charts.md` for the full convention.
 *
 * Period selector is encapsulated here for reuse across reports (Daily/Monthly/Yearly).
 * Use [showPeriodSelector]="true" + [selectedPeriod]/ (periodChange) for one-line integration.
 */
@Component({
  selector: 'app-chart-card',
  standalone: true,
  imports: [NgxEchartsDirective, SkeletonModule, FormsModule, SelectButtonModule],
  templateUrl: './chart-card.component.html',
  host: { class: 'block w-full' }
})
export class ChartCardComponent {
  private readonly themeService = inject(ThemeService);

  title = input.required<string>();
  subtitle = input<string>('');
  options = input<EChartsCoreOption | null>(null);
  loading = input(false);
  heightClass = input('h-72');

  // Period aggregation — optional, reusable across reports
  showPeriodSelector = input(false);
  selectedPeriod = input<ReportPeriod | null>(null);
  periodOptions = input<{ label: string; value: ReportPeriod }[]>(
    REPORT_SERIES_PERIODS.map((v) => ({ label: REPORT_PERIOD_LABELS[v], value: v }))
  );
  periodChange = output<ReportPeriod>();

  readonly emptyText = input<string>('');
  /** How many placeholder ticks to render when data is empty (mirrors metrics Length). */
  readonly placeholderCount = input<number>(14);
  /** Optional explicit Y max; otherwise derived from kind. */
  readonly placeholderYMax = input<number | null>(null);
  /** Semantic hint for Y scale: currency→100, count→10. */
  readonly placeholderYKind = input<PlaceholderYKind | null>(null);
  /** Override X labels; if not provided they are derived from selectedPeriod. */
  readonly placeholderXLabels = input<string[] | null>(null);

  readonly emptyOptions = computed<EChartsCoreOption>(() => {
    // Read theme signal so placeholder chrome recomputes on PrimeNG dark toggle.
    this.themeService.isDark();
    const axisColor = echartsAxisColor();
    const labelColor = echartsLabelColor();
    const gridColor = echartsGridColor();
    const count = this.placeholderCount();
    const xData =
      this.placeholderXLabels() ??
      (this.selectedPeriod() != null
        ? generatePlaceholderCategoryLabels(this.selectedPeriod(), count)
        : generatePlaceholderCategoryLabels(null, count));

    const yMax = resolvePlaceholderYMax(this.placeholderYKind(), this.placeholderYMax());
    const yInterval = resolvePlaceholderYInterval(yMax);
    const isDaily = this.selectedPeriod() === ReportPeriod.Daily;

    return {
      tooltip: { trigger: 'axis', show: false },
      legend: { show: false, data: [], bottom: 0 },
      grid: { left: 16, right: 16, top: 16, bottom: 36, containLabel: true, borderColor: 'transparent' },
      xAxis: {
        type: 'category',
        data: xData,
        boundaryGap: true,
        axisLine: { lineStyle: { color: axisColor } },
        axisTick: { show: false },
        // Daily uses two-line labels (weekday\nmonth day) so keep multiline readable.
        axisLabel: {
          fontSize: 10,
          color: labelColor,
          interval: 0,
          rotate: isDaily ? 0 : 18,
          lineHeight: isDaily ? 12 : undefined
        } as unknown as Record<string, unknown>,
        splitLine: { show: false }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: yMax,
        interval: yInterval,
        axisLine: { show: false },
        axisLabel: { fontSize: 10, color: labelColor },
        splitLine: { show: true, lineStyle: { type: 'dashed', color: gridColor } }
      },
      series: [],
      ...(this.emptyText()
        ? {
            graphic: {
              type: 'text',
              left: 'center',
              top: 'middle',
              style: {
                text: this.emptyText(),
                fill: labelColor,
                fontSize: 12,
                fontWeight: 500
              }
            }
          } as unknown as EChartsCoreOption
        : {})
    };
  });

  onPeriodChange(value: ReportPeriod): void {
    this.periodChange.emit(value);
  }
}
