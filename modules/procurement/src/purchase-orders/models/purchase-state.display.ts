import { PurchaseState } from '../enums/purchase-state.enum';

export function purchaseStateLabel(state: PurchaseState): string {
  switch (state) {
    case PurchaseState.Draft:
      return 'Draft';
    case PurchaseState.Submitted:
      return 'Submitted';
    case PurchaseState.Approved:
      return 'Approved';
    case PurchaseState.Reopened:
      return 'Reopened';
    case PurchaseState.Completed:
      return 'Completed';
    case PurchaseState.Cancelled:
      return 'Cancelled';
    case PurchaseState.Rejected:
      return 'Rejected';
    default:
      return 'Unknown';
  }
}

export function purchaseStateSeverity(
  state: PurchaseState
): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
  switch (state) {
    case PurchaseState.Completed:
      return 'success';
    case PurchaseState.Approved:
      return 'info';
    case PurchaseState.Submitted:
      return 'warn';
    case PurchaseState.Reopened:
      return 'warn';
    case PurchaseState.Draft:
      return 'secondary';
    case PurchaseState.Cancelled:
    case PurchaseState.Rejected:
      return 'danger';
    default:
      return 'secondary';
  }
}
