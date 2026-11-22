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
  allowed: readonly number[],
): number | null {
  return parseOptionalEnumScalarParam(map.get(key), allowed);
}

/**
 * Validates a raw tab query param value against a string enum.
 * `aliases` maps legacy slugs (e.g. `overview`) onto canonical tab values.
 * Returns the matching enum value or `null` if invalid/missing.
 */
export function parseStringEnumTab<EnumMap extends Record<string, string>>(
  enumMap: EnumMap,
  value: string | number | null,
  aliases: Readonly<Record<string, EnumMap[keyof EnumMap]>> = {},
): EnumMap[keyof EnumMap] | null {
  if (value === null) {
    return null;
  }
  const raw = typeof value === 'number' ? String(value) : value;
  if (Object.prototype.hasOwnProperty.call(aliases, raw)) {
    return aliases[raw];
  }
  const tabValues = Object.values(enumMap) as EnumMap[keyof EnumMap][];
  return tabValues.includes(raw as EnumMap[keyof EnumMap]) ? (raw as EnumMap[keyof EnumMap]) : null;
}
