import { SupplierDetailsTab } from '../store/supplier-details/supplier-details.reducer';

const TAB_VALUES = Object.values(SupplierDetailsTab) as string[];

/** Validates a raw tab slug against `SupplierDetailsTab`; `null` → keep the default tab. */
export function toSupplierDetailsTab(value: string | number | null): SupplierDetailsTab | null {
  if (value === null) {
    return null;
  }
  const raw = typeof value === 'number' ? String(value) : value;
  return TAB_VALUES.includes(raw) ? (raw as SupplierDetailsTab) : null;
}
