import type { PagingQueryRequest } from '@invoria/utils';
import type { ReportPeriod } from '@invoria/utils';

/** Query for GET /report/purchase-orders/sales/metrics?period&skip&length */
export interface ListPurchaseSalesReportRequest extends PagingQueryRequest {
  period: ReportPeriod;
}

/** Query for GET /report/purchase-orders/completion/metrics?period&skip&length */
export interface ListPurchaseCompletionReportRequest extends PagingQueryRequest {
  period: ReportPeriod;
}
