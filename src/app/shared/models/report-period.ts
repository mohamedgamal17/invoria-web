/**
 * Report aggregation period as defined by the backend (`ReportPeriod` enum).
 * Values match the wire contract in swagger (`Daily=5`, `Monthly=10`, `Yearly=15`, `AllTime=20`).
 */
export enum ReportPeriod {
  Daily = 5,
  Monthly = 10,
  Yearly = 15,
  AllTime = 20,
}

export const REPORT_PERIOD_LABELS: Record<ReportPeriod, string> = {
  [ReportPeriod.Daily]: 'Daily',
  [ReportPeriod.Monthly]: 'Monthly',
  [ReportPeriod.Yearly]: 'Yearly',
  [ReportPeriod.AllTime]: 'All-time',
};

/** Periods that yield a time-series for the metrics endpoints (AllTime is a single snapshot). */
export const REPORT_SERIES_PERIODS: ReportPeriod[] = [
  ReportPeriod.Daily,
  ReportPeriod.Monthly,
  ReportPeriod.Yearly,
];
