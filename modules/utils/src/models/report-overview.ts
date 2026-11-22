/**
 * Generic overview contract returned by every `/report/.../overview` endpoint.
 * Holds the same period snapshot for the current day, month, year and all-time.
 */
export interface ReportOverview<T> {
  thisDay: T;
  thisMonth: T;
  thisYear: T;
  allTime: T;
}
