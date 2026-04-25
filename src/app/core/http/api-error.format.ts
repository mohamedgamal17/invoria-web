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
  const n: ApiNormalizedError = normalizeApiError(err);

  const max = opts?.maxValidationLines ?? 4;
  const statusPrefix = n.status ? `${n.status} ` : '';

  if (n.validationErrors && Object.keys(n.validationErrors).length) {
    const lines = flattenValidationErrors(n.validationErrors);
    const shown = lines.slice(0, max);
    const more = lines.length > shown.length ? ` (+${lines.length - shown.length} more)` : '';
    const head = n.detail ?? `${statusPrefix}${n.title}`.trim();
    return shown.length ? `${head}\n${shown.join('\n')}${more}` : head;
  }

  if (!n.detail) {
    if (n.kind === 'not-found') return 'The requested resource was not found.';
    if (n.kind === 'internal') return 'An internal server error occurred. Please try again.';
    if (n.kind === 'service-unavailable') return 'The service is currently unavailable. Please try again shortly.';
    if (n.kind === 'offline') return 'No internet connection or API unreachable. Please check your network.';
  }

  return (n.detail ?? `${statusPrefix}${n.title}`.trim()) || 'Unexpected error.';
}

