import { Component, input } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsCoreOption } from 'echarts/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-report-chart',
  standalone: true,
  imports: [NgxEchartsDirective, SkeletonModule],
  templateUrl: './report-chart.component.html'
})
export class ReportChartComponent {
  title = input.required<string>();
  subtitle = input<string>('');
  options = input<EChartsCoreOption | null>(null);
  loading = input(false);
  heightClass = input('h-72');
}
