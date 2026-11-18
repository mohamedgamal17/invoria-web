import type { PagingQueryRequest } from '../../../shared/requests/paging-query.request';
import type { ReportPeriod } from '../../../shared/models/report-period';

/** Query for GET /report/purchase-orders/sales/metrics?period&skip&length */
export interface ListPurchaseSalesReportRequest extends PagingQueryRequest {
  period: ReportPeriod;
}

/** Query for GET /report/purchase-orders/completion/metrics?period&skip&length */
export interface ListPurchaseCompletionReportRequest extends PagingQueryRequest {
  period: ReportPeriod;
}
