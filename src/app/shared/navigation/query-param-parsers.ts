import type { ParamMap } from '@angular/router';

/**
 * Parses a single scalar query-param value as an integer; returns null if missing,
 * invalid, or not in `allowed`. Works with raw router-store `Params` values.
 */
export function parseOptionalEnumScalarParam(
  raw: string | number | null,
  allowed: readonly number[],
): number | null {
  if (raw == null || String(raw).trim() === '') {
    return null;
  }
  const parsedValue = Number.parseInt(String(raw), 10);
  if (!Number.isFinite(parsedValue) || !allowed.includes(parsedValue)) {
    return null;
  }
  return parsedValue;
}

/**
 * Parses `?key=` as an integer query param; returns null if missing, invalid, or not in `allowed`.
 */
export function parseOptionalEnumQueryParam(
  map: ParamMap,
  key: string,
  allowed: readonly number[]
): number | null {
  return parseOptionalEnumScalarParam(map.get(key), allowed);
}
