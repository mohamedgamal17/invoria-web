import type { ReportPeriod } from '@invoria/utils';

/**
 * Period snapshot for supplier creation (GET /report/suppliers/creation/overview|metrics).
 * Swagger: InvoriaProcurementContractsDtosReportSupplierMetricsPeriodDto.
 */
export interface SupplierCreationReportPeriod {
  date: string;
  totalCount: number;
  period: ReportPeriod;
}
