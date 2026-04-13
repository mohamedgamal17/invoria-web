import { HttpErrorResponse } from '@angular/common/http';

import type { ApiResponse } from '../models/api-response';
import type { ApiNormalizedError, ValidationErrors } from './api-http-error';

type ProblemDetailsLike = {
  title?: unknown;
  detail?: unknown;
  status?: unknown;
  errors?: unknown;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function toStringOrUndefined(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

function toNumberOrUndefined(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}

function tryExtractValidationErrors(payload: unknown): ValidationErrors | undefined {
  // Common shapes:
  // - ASP.NET ProblemDetails: { errors: { Field: [ "msg" ] } }
  // - Custom: { validationErrors: { ... } }
  if (!isRecord(payload)) return undefined;
  const candidate = (payload['errors'] ?? payload['validationErrors']) as unknown;
  if (!isRecord(candidate)) return undefined;

  const out: ValidationErrors = {};
  for (const [key, value] of Object.entries(candidate)) {
    if (Array.isArray(value)) {
      const msgs = value.filter((x) => typeof x === 'string') as string[];
      if (msgs.length) out[key] = msgs;
    } else if (typeof value === 'string') {
      out[key] = [value];
    }
  }
  return Object.keys(out).length ? out : undefined;
}

function tryExtractProblemDetails(payload: unknown): ApiNormalizedError | undefined {
  if (!isRecord(payload)) return undefined;
  const pd = payload as ProblemDetailsLike;

  const title = toStringOrUndefined(pd.title);
  const detail = toStringOrUndefined(pd.detail);
  const status = toNumberOrUndefined(pd.status);
  const validationErrors = tryExtractValidationErrors(payload);

  if (title || detail || validationErrors || status !== undefined) {
    return {
      status,
      title: title ?? 'Request failed',
      detail,
      validationErrors,
      raw: payload
    };
  }
  return undefined;
}

function tryExtractApiResponseFailure(payload: unknown): ApiNormalizedError | undefined {
  // Some backends return 200 + { isSuccess:false, error: ... }.
  if (!isRecord(payload)) return undefined;
  if (typeof payload['isSuccess'] !== 'boolean') return undefined;

  const body = payload as unknown as ApiResponse<unknown>;
  if (body.isSuccess) return undefined;

  const error = body.error;
  if (typeof error === 'string') {
    return { title: 'Request failed', detail: error, raw: payload };
  }

  const problem = tryExtractProblemDetails(error);
  if (problem) return problem;

  const validationErrors = tryExtractValidationErrors(error);
  if (validationErrors) {
    return { title: 'Validation failed', validationErrors, raw: payload };
  }

  if (isRecord(error) && typeof error['message'] === 'string') {
    return { title: 'Request failed', detail: error['message'] as string, raw: payload };
  }

  return { title: 'Request failed', detail: safeJson(error), raw: payload };
}

function safeJson(v: unknown): string {
  try {
    return typeof v === 'string' ? v : JSON.stringify(v);
  } catch {
    return 'Request failed.';
  }
}

export function normalizeApiError(err: unknown): ApiNormalizedError {
  // Already normalized?
  if (isRecord(err) && err['name'] === 'ApiHttpError' && isRecord(err['normalized'])) {
    return (err as any).normalized as ApiNormalizedError;
  }

  // HttpErrorResponse (non-2xx or network error)
  if (err instanceof HttpErrorResponse) {
    const payload = err.error;

    const fromApiResponse = tryExtractApiResponseFailure(payload);
    if (fromApiResponse) {
      return { ...fromApiResponse, status: err.status ?? fromApiResponse.status, raw: payload };
    }

    const fromProblem = tryExtractProblemDetails(payload);
    if (fromProblem) {
      return { ...fromProblem, status: err.status ?? fromProblem.status, raw: payload };
    }

    const validationErrors = tryExtractValidationErrors(payload);
    if (validationErrors) {
      return {
        status: err.status,
        title: 'Validation failed',
        validationErrors,
        raw: payload
      };
    }

    const message =
      typeof payload === 'string'
        ? payload
        : (isRecord(payload) && typeof payload['message'] === 'string'
            ? (payload['message'] as string)
            : err.message);

    return {
      status: err.status,
      title: err.status ? `Request failed (${err.status})` : 'Request failed',
      detail: message || 'Request failed.',
      raw: payload
    };
  }

  // Generic JS errors
  if (err instanceof Error) {
    return { title: 'Error', detail: err.message, raw: err };
  }

  // Unknown
  return { title: 'Error', detail: safeJson(err), raw: err };
}

