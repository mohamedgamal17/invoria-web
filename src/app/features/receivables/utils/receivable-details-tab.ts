import { ReceivableDetailsTab } from '../store/receivable-details/receivable-details.reducer';

const TAB_VALUES = Object.values(ReceivableDetailsTab) as string[];

/** Validates a raw tab slug against `ReceivableDetailsTab`; `null` → keep the default tab. */
export function toReceivableDetailsTab(value: string | number | null): ReceivableDetailsTab | null {
  if (value === null) {
    return null;
  }
  const raw = typeof value === 'number' ? String(value) : value;
  return TAB_VALUES.includes(raw) ? (raw as ReceivableDetailsTab) : null;
}
