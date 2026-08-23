import type { PagingQueryRequest } from '../../../shared/requests/paging-query.request';
import type { ReportPeriod } from '../../../shared/models/report-period';

/**
 * Query for GET /report/suppliers/creation/metrics?Period&Skip&Length
 */
export interface ListSupplierCreationReportRequest extends PagingQueryRequest {
  Period: ReportPeriod;
}
