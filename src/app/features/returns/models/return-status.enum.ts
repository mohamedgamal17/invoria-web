export enum ReturnStatus {
  Pending = 0,
  Rejected = 5,
  Approved = 10,
  Completed = 20
}

export function returnStatusLabel(status: ReturnStatus): string {
  switch (status) {
    case ReturnStatus.Pending:
      return 'PENDING';
    case ReturnStatus.Rejected:
      return 'REJECTED';
    case ReturnStatus.Approved:
      return 'APPROVED';
    case ReturnStatus.Completed:
      return 'COMPLETED';
    default:
      return 'UNKNOWN';
  }
}

export function returnStatusUserLabel(status: ReturnStatus): string {
  switch (status) {
    case ReturnStatus.Pending:
      return 'Pending';
    case ReturnStatus.Rejected:
      return 'Rejected';
    case ReturnStatus.Approved:
      return 'Approved';
    case ReturnStatus.Completed:
      return 'Completed';
    default:
      return 'Unknown';
  }
}

export function returnStatusSeverity(
  status: ReturnStatus
): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
  switch (status) {
    case ReturnStatus.Completed:
      return 'success';
    case ReturnStatus.Approved:
      return 'info';
    case ReturnStatus.Pending:
      return 'warn';
    case ReturnStatus.Rejected:
      return 'danger';
    default:
      return 'secondary';
  }
}
