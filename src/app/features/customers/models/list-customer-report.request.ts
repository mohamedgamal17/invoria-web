import type { PagingQueryRequest } from '../../../shared/requests/paging-query.request';
import type { ReportPeriod } from '../../../shared/models/report-period';

/**
 * Query for GET /report/customers/creation/metrics?period&skip&length
 */
export interface ListCustomerCreationReportRequest extends PagingQueryRequest {
  period: ReportPeriod;
}
