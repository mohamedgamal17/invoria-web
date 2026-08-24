# Charts — ECharts via ngx-echarts (canonical)

This is the **single source of truth for charts** in Invoria Web. All future charts must use this stack. Do **not** introduce `primeng/chart`, `chart.js`, or raw `echarts` per-component registrations.

## Stack

- `echarts@^6.1.0` + `ngx-echarts@^22.0.0` (already in `package.json`, installed).
- One-time tree-shaken registration in `src/app/app.config.ts:10-18`:
  ```ts
  import { provideEchartsCore } from 'ngx-echarts';
  import * as echarts from 'echarts/core';
  import { BarChart, LineChart } from 'echarts/charts';
  import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent } from 'echarts/components';
  import { CanvasRenderer } from 'echarts/renderers';
  echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, CanvasRenderer]);
  // in providers: provideEchartsCore({ echarts })
  ```
  To add a chart type (e.g. `PieChart`), import it and add to that single `echarts.use([...])` — do not register elsewhere.

## Canonical wrapper

- `src/app/shared/ui/chart-card/chart-card.component.ts` — selector `app-chart-card` (also re-exported as `src/app/features/dashboard/components/report-chart/report-chart.component.ts` for the dashboard; prefer the shared import for new features).
- Props: `title: string` (required), `subtitle?: string`, `options: EChartsCoreOption | null`, `loading: boolean`, `heightClass = 'h-72'`.
- Template: `<div echarts [options]="options()!" [autoResize]="true">` with skeleton + empty state — see `chart-card.component.html:17`.

## How to add a chart (pattern)

In a **smart page** (e.g. `features/orders/pages/...`):

```ts
import type { EChartsCoreOption } from 'echarts/core';
import { ChartCardComponent } from '../../../../shared/ui/chart-card/chart-card.component';
import { ECHARTS_PALETTE, ECHARTS_GRID_COMPACT } from '../../../../shared/charts/echarts-presets';

@Component({
  standalone: true,
  imports: [ChartCardComponent, ...],
  template: `<app-chart-card title="Revenue" [options]="chart()" [loading]="isLoading()" />`
})
export class MyPage {
  readonly data = signal<MyPeriodDto[]>([]);
  readonly chart = computed<EChartsCoreOption | null>(() => {
    const rows = [...this.data()].reverse();
    if (!rows.length) return null;
    return {
      tooltip: { trigger: 'axis' },
      grid: ECHARTS_GRID_COMPACT,
      xAxis: { type: 'category', data: rows.map(r => formatLabel(r.date)), boundaryGap: false },
      yAxis: { type: 'value' },
      series: [{ type: 'line', smooth: true, areaStyle: { opacity: 0.2 }, data: rows.map(r => r.total) }],
      color: [ECHARTS_PALETTE.primary]
    };
  });
}
```

Rules:
- Compute `EChartsCoreOption` in the **smart component** via `computed()`; the chart card is dumb.
- Type `options` as `EChartsCoreOption` (never `any`).
- Use `ECHARTS_PALETTE` / `ECHARTS_GRID_COMPACT` from `shared/charts/echarts-presets.ts` for consistency and dark-mode-friendly contrast (PrimeNG `.dark` already handles `bg-surface`/`text-muted-foreground`; ECharts palette stays constant).
- For report trends, derive labels via `formatPeriodLabel(date, period)` which mirrors `dashboard-page.component.ts:247` Daily/Monthly/Yearly logic and `ReportPeriod` (Daily=5, Monthly=10, Yearly=15) from `shared/models/report-period.ts`.

## Anti-patterns

- Do not `import * as echarts from 'echarts'` fully (bloat) — use `echarts/core` + explicit `echarts.use`.
- Do not call `provideEchartsCore` outside `app.config.ts`.
- Do not use `<p-chart>` from PrimeNG.

## Reference

- Dashboard live example: `src/app/features/dashboard/pages/dashboard-page/dashboard-page.component.ts:124-241` (profit/sales/customer/product charts).
- Wrapper: `src/app/shared/ui/chart-card/chart-card.component.html:1`.

## Memory

If you are an agent/model, treat this file as the preference: for any chart request in this repo, use ECharts + `app-chart-card` as described, unless the user explicitly asks for another library.
