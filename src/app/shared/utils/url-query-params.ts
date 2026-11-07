/**
 * Returns a single scalar value for a query param, or `null` when the value
 * is absent or unusable (repeated params, non-scalar types).
 */
export function scalarParamValue(value: unknown): string | number | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (Array.isArray(value)) {
    return value.length === 1 ? scalarParamValue(value[0]) : null;
  }
  return typeof value === 'string' || typeof value === 'number' ? value : null;
}

/** Returns a numeric query-param value, or `null` when absent/invalid (parse helpers then apply defaults). */
export function numberParamValue(value: unknown): number | null {
  const raw = scalarParamValue(value);
  return raw === null ? null : Number(raw);
}
