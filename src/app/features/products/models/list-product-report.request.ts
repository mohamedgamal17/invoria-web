import type { PagingQueryRequest } from '../../../shared/requests/paging-query.request';
import type { ReportPeriod } from '../../../shared/models/report-period';

/**
 * Query for GET /report/products/creation/metrics?period&skip&length
 * `period` must be Daily/Monthly/Yearly (AllTime is overview-only).
 */
export interface ListProductCreationReportRequest extends PagingQueryRequest {
  period: ReportPeriod;
}
