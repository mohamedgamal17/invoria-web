import { formatApiError } from './api-error.format';
import type { ApiNormalizedError } from './api-http-error';
import { normalizeApiError } from './api-error.normalize';

export type ApiErrorRouteTarget = '/not-found' | '/internal-error' | '/service-unavailable';

export type ApiErrorPresentation = {
  normalized: ApiNormalizedError;
  toast: { severity: 'error' | 'warn'; summary: string; detail: string };
  routeTarget?: ApiErrorRouteTarget;
};

export function presentApiError(error: unknown, summary = 'Error'): ApiErrorPresentation {
  const normalized = normalizeApiError(error);
  const detail = formatApiError(error);

  const toast = {
    severity: (normalized.kind === 'validation' ? 'warn' : 'error') as 'warn' | 'error',
    summary: normalized.kind === 'validation' ? 'Validation' : summary,
    detail
  };

  return {
    normalized,
    toast,
    routeTarget: getRouteTarget(normalized)
  };
}

export function getRouteTarget(normalized: ApiNormalizedError): ApiErrorRouteTarget | undefined {
  if (normalized.kind === 'not-found') return '/not-found';
  if (normalized.kind === 'internal') return '/internal-error';
  if (normalized.kind === 'service-unavailable' || normalized.kind === 'offline') {
    return '/service-unavailable';
  }
  return undefined;
}

