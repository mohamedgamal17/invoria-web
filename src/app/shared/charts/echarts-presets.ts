import type { EChartsCoreOption } from 'echarts/core';

/** Shared palette — keep charts visually consistent across features. */
export const ECHARTS_PALETTE = {
  primary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#0ea5e9',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
  muted: '#64748b'
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

export function formatPeriodLabel(iso: string, period: number): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  // ReportPeriod values: Daily=5, Monthly=10, Yearly=15
  if (period === 10) return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  if (period === 15) return String(d.getFullYear());
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
