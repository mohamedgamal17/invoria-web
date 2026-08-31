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

import { environment } from '../../../environments/environment';
import { ApiEmptyResponseError, ApiHttpError } from './api-http-error';
import { normalizeApiError } from './api-error.normalize';

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/?$/, '/');
}

function isApiUrl(url: string, apiBaseUrl: string): boolean {
  // We only want to enforce ApiResponse expectations on our backend calls.
  // If `environment.apiUrl` is relative, fall back to prefix check.
  return url.startsWith(apiBaseUrl);
}

export const apiResponseInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const apiBaseUrl = normalizeBaseUrl(environment.apiUrl);

  return next(req).pipe(
    map((event) => {
      if (event instanceof HttpResponse && isApiUrl(req.url, apiBaseUrl)) {
        // Treat empty-body "success" as a failure since callers expect ApiResponse<T>.
        // Backend validation must never respond 204 with no body.
        if (event.status === 204 || event.body === null) {
          throw new ApiEmptyResponseError(req.url, event.status);
        }
      }
      return event;
    }),
    catchError((err: unknown) => {
      // Convert HttpErrorResponse / unknown into a consistent Error type that UI can display.
      if (err instanceof ApiHttpError) {
        return throwError(() => err);
      }
      const normalized = normalizeApiError(err);
      return throwError(() => new ApiHttpError(normalized));
    })
  );
};

