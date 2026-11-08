import { ProductDetailsTab } from '../store/product-details/product-details.reducer';

const TAB_VALUES = Object.values(ProductDetailsTab) as string[];

/** Validates a raw tab slug against `ProductDetailsTab`; `null` → keep the default tab. */
export function toProductDetailsTab(value: string | number | null): ProductDetailsTab | null {
  if (value === null) {
    return null;
  }
  const raw = typeof value === 'number' ? String(value) : value;
  return TAB_VALUES.includes(raw) ? (raw as ProductDetailsTab) : null;
}
