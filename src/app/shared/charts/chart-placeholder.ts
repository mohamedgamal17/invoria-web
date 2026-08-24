import { ReportPeriod } from '../models/report-period';
import { formatPeriodLabel } from './echarts-presets';

/**
 * Generates contextual placeholder category labels when chart data is empty.
 * Goal: keep axes/grids visible so the user can see period structure (x) and scale (y)
 * even without marks. See `ai/charts.md` convention: period = Daily|Monthly|Yearly (5|10|15).
 *
 * - Daily  : `Mon\nAug 19` (weekday on line 1, month+day on line 2) – last `count` days incl. today
 * - Monthly: `Aug 2025` etc. – last `count` months incl. current month (via formatPeriodLabel)
 * - Yearly : `2025` etc. – last `count` years incl. current year
 * - Fallback (null / AllTime or unknown): generic 1..count or short date fallback
 */
export function generatePlaceholderCategoryLabels(
  period: ReportPeriod | null | undefined,
  count = 14,
  now = new Date()
): string[] {
  const safeCount = Math.max(1, Math.min(60, Math.floor(count)));
  if (period === ReportPeriod.Daily) {
    return Array.from({ length: safeCount }, (_, idx) => {
      const offset = safeCount - 1 - idx;
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - offset);
      const weekday = d.toLocaleDateString(undefined, { weekday: 'short' });
      const monthDay = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      return `${weekday}\n${monthDay}`;
    });
  }

  if (period === ReportPeriod.Monthly) {
    return Array.from({ length: safeCount }, (_, idx) => {
      const offset = safeCount - 1 - idx;
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(1);
      d.setMonth(d.getMonth() - offset);
      // Reuse canonical formatter for locale parity
      return formatPeriodLabel(d.toISOString(), ReportPeriod.Monthly);
    });
  }

  if (period === ReportPeriod.Yearly) {
    return Array.from({ length: safeCount }, (_, idx) => {
      const offset = safeCount - 1 - idx;
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setMonth(0, 1);
      d.setFullYear(d.getFullYear() - offset);
      return formatPeriodLabel(d.toISOString(), ReportPeriod.Yearly);
    });
  }

  // Generic / AllTime fallback – no temporal progression, just indexed placeholders
  // Keeps xAxis populated so grid renders.
  return Array.from({ length: safeCount }, (_, i) => String(i + 1));
}

export type PlaceholderYKind = 'currency' | 'count';

export function resolvePlaceholderYMax(kind: PlaceholderYKind | null | undefined, explicitMax: number | null | undefined): number {
  if (explicitMax != null && Number.isFinite(explicitMax) && explicitMax > 0) return explicitMax;
  if (kind === 'count') return 10;
  return 100;
}

export function resolvePlaceholderYInterval(max: number): number {
  if (max <= 10) return 2;
  if (max <= 50) return 10;
  if (max <= 200) return 20;
  if (max <= 1000) return 200;
  return Math.ceil(max / 5);
}
