import type { ReportPeriod } from '../../../shared/models/report-period';

/**
 * Period snapshot for supplier creation (GET /report/suppliers/creation/overview|metrics).
 * Swagger: InvoriaProcurementContractsDtosReportSupplierMetricsPeriodDto.
 */
export interface SupplierCreationReportPeriod {
  date: string;
  totalCount: number;
  period: ReportPeriod;
}
