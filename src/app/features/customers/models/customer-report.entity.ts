import type { ReportPeriod } from '../../../shared/models/report-period';

/**
 * Period snapshot for customer creation (GET /report/customers/creation/overview|metrics).
 * Wire shape from swagger: InvoriaCustomerManagementContractsDtosReportCustomerMetricsPeriodDto.
 */
export interface CustomerCreationReportPeriod {
  date: string;
  totalCount: number;
  period: ReportPeriod;
}
