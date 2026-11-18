import type { PagingQueryRequest } from '../../../shared/requests/paging-query.request';
import type { ReportPeriod } from '../../../shared/models/report-period';

/** Query for GET /report/orders/sales/metrics?period&skip&length */
export interface ListOrderSalesReportRequest extends PagingQueryRequest {
  period: ReportPeriod;
}

/** Query for GET /report/orders/sales-profit/metrics?period&skip&length */
export interface ListOrderSalesProfitReportRequest extends PagingQueryRequest {
  period: ReportPeriod;
}

/** Query for GET /report/orders/completion/metrics?period&skip&length */
export interface ListOrderCompletionReportRequest extends PagingQueryRequest {
  period: ReportPeriod;
}
