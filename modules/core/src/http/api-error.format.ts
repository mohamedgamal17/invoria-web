import type { ApiNormalizedError } from './api-http-error';
import { normalizeApiError } from './api-error.normalize';

function flattenValidationErrors(errors: Record<string, string[]>): string[] {
  const lines: string[] = [];
  for (const [field, msgs] of Object.entries(errors)) {
    for (const msg of msgs) {
      lines.push(field ? `${field}: ${msg}` : msg);
    }
  }
  return lines;
}

export function formatApiError(err: unknown, opts?: { maxValidationLines?: number }): string {
  const normalized: ApiNormalizedError = normalizeApiError(err);

  const max = opts?.maxValidationLines ?? 4;
  const statusPrefix = normalized.status ? `${normalized.status} ` : '';

  if (normalized.validationErrors && Object.keys(normalized.validationErrors).length) {
    const lines = flattenValidationErrors(normalized.validationErrors);
    const shown = lines.slice(0, max);
    const more = lines.length > shown.length ? ` (+${lines.length - shown.length} more)` : '';
    const head = normalized.detail ?? `${statusPrefix}${normalized.title}`.trim();
    return shown.length ? `${head}\n${shown.join('\n')}${more}` : head;
  }

  if (!normalized.detail) {
    if (normalized.kind === 'not-found') return 'The requested resource was not found.';
    if (normalized.kind === 'internal') {
      return 'An internal server error occurred. Please try again.';
    }
    if (normalized.kind === 'service-unavailable') return 'The service is currently unavailable. Please try again shortly.';
    if (normalized.kind === 'offline') return 'No internet connection or API unreachable. Please check your network.';
  }

  return (normalized.detail ?? `${statusPrefix}${normalized.title}`.trim()) || 'Unexpected error.';
}

