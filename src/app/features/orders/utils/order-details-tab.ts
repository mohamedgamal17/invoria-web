/** Tabs of the order details page, as zero-based `p-tabs` indexes. */
export type OrderDetailsTab = 0 | 1 | 2 | 3;

/** URL slugs for the details tabs. */
export const ORDER_DETAILS_TAB_SLUGS = ['summary', 'lineItems', 'payment', 'returns'] as const;

/**
 * Validates a raw `tab` query value against `OrderDetailsTab`; `null` → keep
 * the default tab. Known legacy slugs (`overview` and the empty string) and
 * missing values map to the Summary tab.
 */
export function toOrderDetailsTab(value: string | number | null): OrderDetailsTab | null {
  if (value === null) {
    return null;
  }
  if (typeof value === 'number') {
    return [0, 1, 2, 3].includes(value) ? (value as OrderDetailsTab) : null;
  }
  switch (value) {
    case 'summary':
    case 'overview':
    case '':
      return 0;
    case 'lineItems':
      return 1;
    case 'payment':
      return 2;
    case 'returns':
      return 3;
    default:
      return null;
  }
}

/** URL slug for a tab index; unknown indexes fall back to `summary`. */
export function orderDetailsTabToSlug(index: number): string {
  return ORDER_DETAILS_TAB_SLUGS[index] ?? ORDER_DETAILS_TAB_SLUGS[0];
}
