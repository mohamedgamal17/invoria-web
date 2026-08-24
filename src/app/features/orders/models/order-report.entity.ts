import type { ReportPeriod } from '../../../shared/models/report-period';

/**
 * Sales snapshot (GET /report/orders/sales/overview|metrics).
 * Swagger: InvoriaOrderingContractsOrdersDtosReportOrderSalesMetricsPeriodDto.
 */
export interface OrderSalesReportPeriod {
  date: string;
  totalAmount: number;
  totalNetAmount: number;
  totalReturnAmount: number;
  period: ReportPeriod;
}

/**
 * Sales-profit snapshot (GET /report/orders/sales-profit/overview|metrics).
 * Swagger: InvoriaOrderingContractsOrdersDtosReportOrderSalesProfitMetricsPeriodDto.
 */
export interface OrderSalesProfitReportPeriod {
  date: string;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  totalReturnAmount: number;
  period: ReportPeriod;
}

/**
 * Completion snapshot (GET /report/orders/completion/overview|metrics).
 * Swagger: InvoriaOrderingContractsOrdersDtosReportOrderCompletedMetricsPeriodDto.
 */
export interface OrderCompletionReportPeriod {
  date: string;
  totalCount: number;
  period: ReportPeriod;
}
