import type { PagingQueryRequest } from '../../../shared/requests/paging-query.request';
import type { ReportPeriod } from '../../../shared/models/report-period';

/**
 * Query for GET /report/suppliers/creation/metrics?period&skip&length
 */
export interface ListSupplierCreationReportRequest extends PagingQueryRequest {
  period: ReportPeriod;
}
