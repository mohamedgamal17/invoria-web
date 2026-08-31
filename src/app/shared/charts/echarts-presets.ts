import type { EChartsCoreOption } from 'echarts/core';

/**
 * Shared palette — offloaded to PrimeNG Aura defaults.
 * Previously hardcoded to custom Invoria hex (#5e73d4 etc.) and mirrored
 * tokens.css brand/semantic tokens. Now these are fallbacks only; at
 * runtime chart code should resolve via `chartToken('--p-*')` inside a
 * computed() that reads ThemeService.isDark() so colors track PrimeNG.
 *
 * Defaults match Aura primitives: emerald ~ success, amber ~ warning,
 * red ~ danger, cyan/sky ~ info, violet ~ purple.
 */
export const ECHARTS_PALETTE = {
  primary: '#0ea5e9', // --p-primary-color (sky 500 — brand)
  success: '#10b981', // --p-emerald-500
  warning: '#f59e0b', // --p-amber-500
  danger: '#ef4444', // --p-red-500
  info: '#38bdf8', // --p-sky-400 (sky accent, aligned to primary)
  purple: '#8b5cf6', // --p-violet-500
  cyan: '#06b6d4', // --p-cyan-500
  muted: '#71717a' // --p-zinc-500 (PrimeNG muted)
} as const;

export const ECHARTS_COLORS = {
  revenueCostProfit: [ECHARTS_PALETTE.primary, ECHARTS_PALETTE.warning, ECHARTS_PALETTE.success],
  salesReturns: [ECHARTS_PALETTE.info, ECHARTS_PALETTE.danger],
  mono: [ECHARTS_PALETTE.purple]
} as const;

/** Prefer PrimeNG tokens for axes/grid so canvas chrome stays in sync with theme. */
export function echartsAxisColor(): string {
  // Content border tracks --p-content-border-color (light slate-200, dark zinc-700)
  return chartToken('--p-content-border-color', '#e2e8f0');
}
export function echartsLabelColor(): string {
  return chartToken('--p-text-muted-color', '#64748b');
}
export function echartsGridColor(): string {
  return chartToken('--p-surface-200', '#e2e8f0');
}

/** Common grid/tooltip defaults — spread into your EChartsCoreOption. */
export const ECHARTS_GRID_COMPACT: EChartsCoreOption['grid'] = {
  left: 16,
  right: 16,
  top: 16,
  bottom: 24,
  containLabel: true
};

/**
 * Resolve a CSS custom property to its current computed value.
 * PrimeNG generates --p-* variables (and --c-* aliases proxy to them);
 * ECharts renders to canvas and cannot consume `var()` directly, so chart
 * code reads the resolved token at option-build time. Call it inside a
 * `computed()` that also reads `ThemeService.isDark()` so options recompute
 * on theme toggle.
 * Prefer --p-* names (e.g. --p-content-border-color, --p-text-muted-color);
 * --c-* aliases still work as fallback.
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
