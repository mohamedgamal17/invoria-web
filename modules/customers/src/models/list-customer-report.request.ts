import type { PagingQueryRequest } from '@invoria/utils';
import type { ReportPeriod } from '@invoria/utils';

/**
 * Query for GET /report/customers/creation/metrics?period&skip&length
 */
export interface ListCustomerCreationReportRequest extends PagingQueryRequest {
  period: ReportPeriod;
}
