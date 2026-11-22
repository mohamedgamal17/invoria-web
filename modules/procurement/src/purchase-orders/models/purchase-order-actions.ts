import { PurchaseState } from '../enums/purchase-state.enum';

export type PurchaseOrderTransitionAction =
  | 'submit'
  | 'approve'
  | 'reject'
  | 'cancel'
  | 'complete'
  | 'reopen';

export function canEditPurchaseOrder(state: PurchaseState): boolean {
  return state === PurchaseState.Draft || state === PurchaseState.Reopened;
}

/** Workflow actions available for the current purchase order state (excludes edit). */
export function getPurchaseOrderTransitionActions(state: PurchaseState): PurchaseOrderTransitionAction[] {
  switch (state) {
    case PurchaseState.Draft:
      return ['submit', 'cancel'];
    case PurchaseState.Submitted:
      return ['approve', 'reject', 'reopen', 'cancel'];
    case PurchaseState.Reopened:
      return ['submit', 'cancel'];
    case PurchaseState.Approved:
      return ['reopen', 'complete'];
    default:
      return [];
  }
}

export const PURCHASE_ORDER_ACTION_UI: Record<
  PurchaseOrderTransitionAction,
  { label: string; icon: string; severity: 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'help' | 'contrast' }
> = {
  submit: { label: 'Submit', icon: 'pi pi-send', severity: 'success' },
  approve: { label: 'Approve', icon: 'pi pi-check', severity: 'success' },
  reject: { label: 'Reject', icon: 'pi pi-times', severity: 'danger' },
  cancel: { label: 'Cancel', icon: 'pi pi-ban', severity: 'danger' },
  complete: { label: 'Complete', icon: 'pi pi-flag-fill', severity: 'success' },
  reopen: { label: 'Reopen', icon: 'pi pi-replay', severity: 'warn' }
};
