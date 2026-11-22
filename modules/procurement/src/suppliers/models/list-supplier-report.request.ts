import type { PagingQueryRequest } from '@invoria/utils';
import type { ReportPeriod } from '@invoria/utils';

/**
 * Query for GET /report/suppliers/creation/metrics?period&skip&length
 */
export interface ListSupplierCreationReportRequest extends PagingQueryRequest {
  period: ReportPeriod;
}
