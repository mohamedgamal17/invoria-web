import { HttpParams } from '@angular/common/http';

/**
 * Builds {@link HttpParams} from a plain request object (list/query DTOs).
 *
 * - Skips `undefined`, `null`, and functions.
 * - Strings are trimmed; empty strings are omitted (optional query fields).
 * - Numbers and booleans are always sent as string values.
 * - Objects and arrays are skipped; flatten custom shapes before calling if needed.
 */
export function httpParamsFromRequest(request: object): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(request)) {
    if (value === undefined || value === null || typeof value === 'function') {
      continue;
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '') {
        continue;
      }
      params = params.set(key, trimmed);
      continue;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      params = params.set(key, String(value));
    }
  }
  return params;
}
