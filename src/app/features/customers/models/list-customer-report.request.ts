import type { PagingQueryRequest } from '../../../shared/requests/paging-query.request';
import type { ReportPeriod } from '../../../shared/models/report-period';

/**
 * Query for GET /report/customers/creation/metrics?Period&Skip&Length
 */
export interface ListCustomerCreationReportRequest extends PagingQueryRequest {
  Period: ReportPeriod;
}
