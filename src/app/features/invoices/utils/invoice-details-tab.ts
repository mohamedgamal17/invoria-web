/** Tabs of the invoice details page, as zero-based `p-tabs` indexes. */
export type InvoiceDetailsTab = 0 | 1;

/** URL slugs for the details tabs. */
export const INVOICE_DETAILS_TAB_SLUGS = ['overview', 'items'] as const;

/**
 * Validates a raw `tab` query value against `InvoiceDetailsTab`; `null` → keep
 * the current tab. The legacy `overview` slug, the empty string and missing
 * values map to the Overview tab.
 */
export function toInvoiceDetailsTab(value: string | number | null): InvoiceDetailsTab | null {
  if (value === null) {
    return null;
  }
  if (typeof value === 'number') {
    return [0, 1].includes(value) ? (value as InvoiceDetailsTab) : null;
  }
  switch (value) {
    case 'overview':
    case '':
      return 0;
    case 'items':
      return 1;
    default:
      return null;
  }
}

/** URL slug for a tab index; unknown indexes fall back to `overview`. */
export function invoiceDetailsTabToSlug(index: number): string {
  return INVOICE_DETAILS_TAB_SLUGS[index] ?? INVOICE_DETAILS_TAB_SLUGS[0];
}
