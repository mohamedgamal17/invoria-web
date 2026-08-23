import type { ReportPeriod } from '../../../shared/models/report-period';

/**
 * Period snapshot for product creation (GET /report/products/creation/overview|metrics).
 * Wire shape from swagger: InvoriaCatalogContractsDtosReportProductMetricsPeriodDto.
 */
export interface ProductCreationReportPeriod {
  date: string;
  totalCount: number;
  period: ReportPeriod;
}
