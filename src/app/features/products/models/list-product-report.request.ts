import type { PagingQueryRequest } from '../../../shared/requests/paging-query.request';
import type { ReportPeriod } from '../../../shared/models/report-period';

/**
 * Query for GET /report/products/creation/metrics?Period&Skip&Length
 * `Period` must be Daily/Monthly/Yearly (AllTime is overview-only).
 */
export interface ListProductCreationReportRequest extends PagingQueryRequest {
  Period: ReportPeriod;
}
