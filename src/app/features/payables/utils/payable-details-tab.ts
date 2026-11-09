import { PayableDetailsTab } from '../store/payable-details/payable-details.reducer';

const TAB_VALUES = Object.values(PayableDetailsTab) as string[];

/** Validates a raw tab slug against `PayableDetailsTab`; `null` → keep the default tab. */
export function toPayableDetailsTab(value: string | number | null): PayableDetailsTab | null {
  if (value === null) {
    return null;
  }
  const raw = typeof value === 'number' ? String(value) : value;
  return TAB_VALUES.includes(raw) ? (raw as PayableDetailsTab) : null;
}
