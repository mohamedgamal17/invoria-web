import { DEFAULT_CURRENCY_CODE } from '../models/currency';

/** Placeholder rendered for missing numeric values. */
const EMPTY_VALUE = '—';

const numberFormatter = new Intl.NumberFormat();

const currencyFormatters = new Map<string, Intl.NumberFormat>();

function currencyFormatter(currencyCode: string): Intl.NumberFormat {
  const cached = currencyFormatters.get(currencyCode);
  if (cached) {
    return cached;
  }
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0
  });
  currencyFormatters.set(currencyCode, formatter);
  return formatter;
}

/** Formats a numeric amount using the app currency (EGP by default). */
export function formatCurrency(value: number | null | undefined, currencyCode = DEFAULT_CURRENCY_CODE): string {
  if (value == null) {
    return EMPTY_VALUE;
  }
  return currencyFormatter(currencyCode).format(value);
}

/** Formats a numeric value with grouped thousands. */
export function formatNumber(value: number | null | undefined): string {
  if (value == null) {
    return EMPTY_VALUE;
  }
  return numberFormatter.format(value);
}
