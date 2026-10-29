/**
 * `InvoriaFinancialContractsReceivablesEnumsFinancialObligationStatus` (Swagger: integer enum).
 */
export enum FinancialObligationStatus {
  Outstanding = 5,
  PartiallyPaid = 10,
  Paid = 15
}

export function financialObligationStatusLabel(status: FinancialObligationStatus): string {
  switch (status) {
    case FinancialObligationStatus.Outstanding:
      return 'Outstanding';
    case FinancialObligationStatus.PartiallyPaid:
      return 'Partially paid';
    case FinancialObligationStatus.Paid:
      return 'Paid';
    default:
      return 'Unknown';
  }
}

export function financialObligationStatusSeverity(
  status: FinancialObligationStatus
): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
  switch (status) {
    case FinancialObligationStatus.Paid:
      return 'success';
    case FinancialObligationStatus.PartiallyPaid:
      return 'warn';
    case FinancialObligationStatus.Outstanding:
      return 'danger';
    default:
      return 'secondary';
  }
}
