import type { PagingQueryRequest } from '../../../shared/requests/paging-query.request';
import type { ReportPeriod } from '../../../shared/models/report-period';

/** Query for GET /report/orders/sales/metrics?Period&Skip&Length */
export interface ListOrderSalesReportRequest extends PagingQueryRequest {
  Period: ReportPeriod;
}

/** Query for GET /report/orders/sales-profit/metrics?Period&Skip&Length */
export interface ListOrderSalesProfitReportRequest extends PagingQueryRequest {
  Period: ReportPeriod;
}

/** Query for GET /report/orders/completion/metrics?Period&Skip&Length */
export interface ListOrderCompletionReportRequest extends PagingQueryRequest {
  Period: ReportPeriod;
}
