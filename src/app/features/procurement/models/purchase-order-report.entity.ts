import type { ReportPeriod } from '../../../shared/models/report-period';

/**
 * Sales snapshot for purchase orders (GET /report/purchase-orders/sales/overview|metrics).
 * Swagger: InvoriaProcurementContractsDtosReportPurchaseSalesMetricsPeriodDto.
 */
export interface PurchaseSalesReportPeriod {
  date: string;
  totalAmount: number;
  subTotal: number;
  taxAmount: number;
  discountAmount: number;
  period: ReportPeriod;
}

/**
 * Completion snapshot for purchase orders (GET /report/purchase-orders/completion/overview|metrics).
 * Swagger: InvoriaProcurementContractsDtosReportPurchaseOrdersCompletedMetricsPeriodDto.
 */
export interface PurchaseCompletionReportPeriod {
  date: string;
  totalCount: number;
  period: ReportPeriod;
}
