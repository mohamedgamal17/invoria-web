import type { PagingQueryRequest } from '@invoria/utils';
import type { ReportPeriod } from '@invoria/utils';

/**
 * Query for GET /report/products/creation/metrics?period&skip&length
 * `period` must be Daily/Monthly/Yearly (AllTime is overview-only).
 */
export interface ListProductCreationReportRequest extends PagingQueryRequest {
  period: ReportPeriod;
}
