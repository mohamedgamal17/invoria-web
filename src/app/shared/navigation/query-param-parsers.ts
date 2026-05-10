import type { ParamMap } from '@angular/router';

/**
 * Parses `?key=` as an integer query param; returns null if missing, invalid, or not in `allowed`.
 */
export function parseOptionalEnumQueryParam(
  map: ParamMap,
  key: string,
  allowed: readonly number[]
): number | null {
  const raw = map.get(key);
  if (raw == null || raw.trim() === '') {
    return null;
  }
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || !allowed.includes(n)) {
    return null;
  }
  return n;
}
