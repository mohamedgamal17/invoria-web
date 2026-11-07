import { CustomerDetailsTab } from '../store/customer-details/customer-details.reducer';

const TAB_VALUES = Object.values(CustomerDetailsTab) as string[];

/** Validates a raw tab slug against `CustomerDetailsTab`; `null` → keep the default tab. */
export function toCustomerDetailsTab(value: string | number | null): CustomerDetailsTab | null {
  if (value === null) {
    return null;
  }
  const raw = typeof value === 'number' ? String(value) : value;
  return TAB_VALUES.includes(raw) ? (raw as CustomerDetailsTab) : null;
}
