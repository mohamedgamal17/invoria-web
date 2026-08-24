import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsCoreOption } from 'echarts/core';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectButtonModule } from 'primeng/selectbutton';
import {
  REPORT_PERIOD_LABELS,
  REPORT_SERIES_PERIODS,
  ReportPeriod
} from '../../../../shared/models/report-period';
import {
  generatePlaceholderCategoryLabels,
  resolvePlaceholderYInterval,
  resolvePlaceholderYMax,
  type PlaceholderYKind
} from '../../../../shared/charts/chart-placeholder';

@Component({
  selector: 'app-report-chart',
  standalone: true,
  imports: [NgxEchartsDirective, SkeletonModule, FormsModule, SelectButtonModule],
  templateUrl: './report-chart.component.html',
  host: { class: 'block w-full' }
})
export class ReportChartComponent {
  title = input.required<string>();
  subtitle = input<string>('');
  options = input<EChartsCoreOption | null>(null);
  loading = input(false);
  heightClass = input('h-72');

  showPeriodSelector = input(false);
  selectedPeriod = input<ReportPeriod | null>(null);
  periodOptions = input<{ label: string; value: ReportPeriod }[]>(
    REPORT_SERIES_PERIODS.map((v) => ({ label: REPORT_PERIOD_LABELS[v], value: v }))
  );
  periodChange = output<ReportPeriod>();

  readonly emptyText = input<string>('');
  readonly placeholderCount = input<number>(14);
  readonly placeholderYMax = input<number | null>(null);
  readonly placeholderYKind = input<PlaceholderYKind | null>(null);
  readonly placeholderXLabels = input<string[] | null>(null);

  readonly emptyOptions = computed<EChartsCoreOption>(() => {
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
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisTick: { show: false },
        axisLabel: {
          fontSize: 10,
          color: '#64748b',
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
        axisLabel: { fontSize: 10, color: '#64748b' },
        splitLine: { show: true, lineStyle: { type: 'dashed', color: '#f1f5f9' } }
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
                fill: '#94a3b8',
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
