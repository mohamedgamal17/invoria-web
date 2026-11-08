---
name: charts
description: Use when adding or modifying any chart in this repo — ECharts via ngx-echarts with the shared `app-chart-card` wrapper, series colors from `ECHARTS_PALETTE`/`ECHARTS_GRID_COMPACT` presets, theme token resolution via `chartToken`, canonical registration in `app.config.ts`; forbids `primeng/chart`, `chart.js`, per-component echarts registration, and hardcoded hex colors in options.
compatibility: Invoria Web (Angular 21, echarts 6, ngx-echarts 22)
---

# Charts — ECharts via ngx-echarts (canonical)

All charts in this repo use `echarts` + `ngx-echarts` with the shared `app-chart-card`
wrapper. Do **not** introduce `primeng/chart`, `chart.js`, or per-component echarts
registrations.

## 1. Stack and registration

- `echarts@^6.1.0` + `ngx-echarts@^22.0.0` (`package.json`).
- **One-time** tree-shaken registration in `src/app/app.config.ts`:

```ts
import { provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, CanvasRenderer]);
// in providers: provideEchartsCore({ echarts })
```

To add a chart type (e.g. `PieChart`), add it to that single `echarts.use([...])` — do not
register echarts anywhere else.

## 2. Canonical wrapper — `app-chart-card`

`src/app/shared/ui/chart-card/chart-card.component.ts` (the dashboard's
`report-chart` re-exports it; **prefer the shared import** for new features).

Props: `title: string` (required), `subtitle?: string`, `options: EChartsCoreOption | null`,
`loading: boolean`, `heightClass = 'h-72'`, plus report-page extras
(`showPeriodSelector`, `selectedPeriod`, `periodOptions`, `(periodChange)` — see skill
`report-page-scaffold`).

## 3. How to add a chart (pattern, in a smart page)

```ts
import type { EChartsCoreOption } from 'echarts/core';
import { ChartCardComponent } from '...shared/ui/chart-card/chart-card.component';
import { ECHARTS_PALETTE, ECHARTS_GRID_COMPACT } from '...shared/charts/echarts-presets';

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
      xAxis: { type: 'category', data: rows.map((row) => formatPeriodLabel(row.date)), boundaryGap: false },
      yAxis: { type: 'value' },
      series: [{ type: 'line', smooth: true, areaStyle: { opacity: 0.2 }, data: rows.map((row) => row.total) }],
      color: [ECHARTS_PALETTE.primary]
    };
  });
}
```

## 4. Rules

- Compute `EChartsCoreOption` in the **smart page** via `computed()`; the chart card stays dumb.
- Type `options` as `EChartsCoreOption` — **never `any`**.
- Series colors from `ECHARTS_PALETTE` / `ECHARTS_COLORS` / `ECHARTS_GRID_COMPACT`
  (`src/app/shared/charts/echarts-presets.ts`) — never hardcode hex in pages. The palette
  mirrors light-mode semantic tokens in `src/styles/tokens.css`.
- **Theme-aware chart chrome** (axes, grid lines, labels, empty-state text): ECharts renders
  to canvas and cannot consume CSS `var()`. Use `chartToken('--c-border', '#e6e9ee')` from
  `echarts-presets.ts` to resolve a design token at option-build time and read
  `ThemeService.isDark()` inside the same `computed()` so options recompute on theme toggle.
  Only plain-color tokens resolve (avoid `color-mix()`-defined tokens). Reference
  implementation: `src/app/shared/ui/chart-card/chart-card.component.ts`.
- Report trends: derive labels with `formatPeriodLabel(date, period)` and `ReportPeriod`
  (Daily=5, Monthly=10, Yearly=15, AllTime=20) from `src/app/shared/models/report-period.ts`.

## 5. Anti-patterns

- Do not `import * as echarts from 'echarts'` fully (bundle bloat) — use `echarts/core` +
  explicit `echarts.use`.
- Do not call `provideEchartsCore` outside `app.config.ts`.
- Do not use `<p-chart>` from PrimeNG.

## 6. Reference implementations

- Dashboard page: `src/app/features/dashboard/pages/dashboard-page/dashboard-page.component.ts`
- Wrapper template: `src/app/shared/ui/chart-card/chart-card.component.html`
- Report-page scaffolds: skill `report-page-scaffold`
