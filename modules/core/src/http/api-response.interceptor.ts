import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { API_BASE_URL, normalizeApiBaseUrl } from './api-base-url';
import { normalizeApiResponseFailure, normalizeApiError } from './api-error.normalize';
import { ApiEmptyResponseError, ApiHttpError, type ApiNormalizedError } from './api-http-error';

const DEFAULT_FAILURE_ERROR: ApiNormalizedError = {
  kind: 'api',
  title: 'Request failed',
  detail: 'Request failed.'
};

function isApiUrl(url: string, apiBaseUrl: string): boolean {
  return url.startsWith(apiBaseUrl);
}

function isApiResponseFailure(body: unknown): body is Record<string, unknown> & { isSuccess: false } {
  return (
    typeof body === 'object' &&
    body !== null &&
    !Array.isArray(body) &&
    (body as Record<string, unknown>)['isSuccess'] === false
  );
}

export const apiResponseInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const configuredBaseUrl = inject(API_BASE_URL, { optional: true });
  const apiBaseUrl = normalizeApiBaseUrl(configuredBaseUrl ?? 'http://localhost:5000/');

  return next(req).pipe(
    map((event) => {
      if (event instanceof HttpResponse && isApiUrl(req.url, apiBaseUrl)) {
        if (event.status === 204 || event.body === null) {
          throw new ApiEmptyResponseError(req.url, event.status);
        }
        if (event.status >= 200 && event.status < 300 && isApiResponseFailure(event.body)) {
          const normalized =
            normalizeApiResponseFailure(event.body) ?? { ...DEFAULT_FAILURE_ERROR, raw: event.body };
          return event.clone({ body: { ...event.body, error: normalized } });
        }
      }
      return event;
    }),
    catchError((error: unknown) => {
      if (error instanceof ApiHttpError) {
        return throwError(() => error);
      }
      const normalized = normalizeApiError(error);
      return throwError(() => new ApiHttpError(normalized));
    })
  );
};
