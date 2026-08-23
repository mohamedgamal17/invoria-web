import type { PagingQueryRequest } from '../../../shared/requests/paging-query.request';
import type { ReportPeriod } from '../../../shared/models/report-period';

/** Query for GET /report/purchase-orders/sales/metrics?Period&Skip&Length */
export interface ListPurchaseSalesReportRequest extends PagingQueryRequest {
  Period: ReportPeriod;
}

/** Query for GET /report/purchase-orders/completion/metrics?Period&Skip&Length */
export interface ListPurchaseCompletionReportRequest extends PagingQueryRequest {
  Period: ReportPeriod;
}
