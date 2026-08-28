import type { EChartsCoreOption } from 'echarts/core';

/** Shared palette — keep charts visually consistent across features.
 *  Values mirror the light-mode semantic tokens in `src/styles/tokens.css`
 *  (softened for eye comfort; readable on both light and dark surfaces). */
export const ECHARTS_PALETTE = {
  primary: '#5e73d4',
  success: '#2f855a',
  warning: '#b7791f',
  danger: '#c2413c',
  info: '#3a8cb8',
  purple: '#7266c9',
  cyan: '#2f9bbf',
  muted: '#5d6b7e'
} as const;

export const ECHARTS_COLORS = {
  revenueCostProfit: [ECHARTS_PALETTE.primary, ECHARTS_PALETTE.warning, ECHARTS_PALETTE.success],
  salesReturns: [ECHARTS_PALETTE.info, ECHARTS_PALETTE.danger],
  mono: [ECHARTS_PALETTE.purple]
} as const;

/** Common grid/tooltip defaults — spread into your EChartsCoreOption. */
export const ECHARTS_GRID_COMPACT: EChartsCoreOption['grid'] = {
  left: 16,
  right: 16,
  top: 16,
  bottom: 24,
  containLabel: true
};

/**
 * Resolve an Invoria design token (CSS custom property) to its current value.
 * ECharts renders to canvas and cannot consume `var()` directly, so chart code
 * reads the resolved token at option-build time. Call it inside a `computed()`
 * that also reads `ThemeService.isDark()` so options recompute on theme toggle.
 * Only plain-color tokens (`--c-border`, `--c-muted-foreground`, ...) resolve to
 * hex; avoid tokens defined via `color-mix()`.
 */
export function chartToken(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value.length > 0 ? value : fallback;
}

export function formatPeriodLabel(iso: string, period: number): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  // ReportPeriod values: Daily=5, Monthly=10, Yearly=15
  if (period === 10) return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  if (period === 15) return String(d.getFullYear());
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}