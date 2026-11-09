import { PurchaseOrderDetailsTab } from '../store/purchase-order-details/purchase-order-details.reducer';

const TAB_VALUES = Object.values(PurchaseOrderDetailsTab) as string[];

/** Validates a raw tab slug against `PurchaseOrderDetailsTab`; `null` → keep the current tab. */
export function toPurchaseOrderDetailsTab(
  value: string | number | null,
): PurchaseOrderDetailsTab | null {
  if (value === null) {
    return null;
  }
  const raw = typeof value === 'number' ? String(value) : value;
  return TAB_VALUES.includes(raw) ? (raw as PurchaseOrderDetailsTab) : null;
}
