import { ReturnStatus } from './return-status.enum';
import type { Return } from './return.entity';

export type ReturnActionKey = 'approve' | 'reject';

export type ReturnActionUiMeta = {
  label: string;
  icon: string;
  severity: 'success' | 'secondary' | 'info' | 'warn' | 'danger';
};

export const RETURN_ACTION_UI: Record<ReturnActionKey, ReturnActionUiMeta> = {
  approve: {
    label: 'Approve Return',
    icon: 'pi pi-check',
    severity: 'success'
  },
  reject: {
    label: 'Reject Return',
    icon: 'pi pi-times',
    severity: 'danger'
  }
};

export function canApprove(ret: Return): boolean {
  return ret.status === ReturnStatus.Pending;
}

export function canReject(ret: Return): boolean {
  return ret.status === ReturnStatus.Pending;
}

export function getAvailableReturnActions(ret: Return): ReturnActionKey[] {
  const actions: ReturnActionKey[] = [];
  if (canApprove(ret)) actions.push('approve');
  if (canReject(ret)) actions.push('reject');
  return actions;
}

export function getPrimaryReturnAction(ret: Return): ReturnActionKey | null {
  if (canApprove(ret)) return 'approve';
  if (canReject(ret)) return 'reject';
  return null;
}
