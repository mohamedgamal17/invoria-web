import { describe, it, expect } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';

import { normalizeApiError } from './api-error.normalize';

describe('normalizeApiError', () => {
  it('should extract validation errors from ProblemDetails-like payload', () => {
    const err = new HttpErrorResponse({
      status: 400,
      statusText: 'Bad Request',
      error: {
        title: 'Validation failed',
        status: 400,
        errors: {
          Name: ['Name is required.'],
          Price: ['Price must be non-negative.']
        }
      }
    });

    const normalized = normalizeApiError(err);
    expect(normalized.status).toBe(400);
    expect(normalized.kind).toBe('validation');
    expect(normalized.validationErrors?.['Name']?.[0]).toBe('Name is required.');
    expect(normalized.validationErrors?.['Price']?.[0]).toBe('Price must be non-negative.');
  });

  it('should classify 404 as not-found', () => {
    const err = new HttpErrorResponse({
      status: 404,
      statusText: 'Not Found',
      error: { title: 'Not found' }
    });

    const normalized = normalizeApiError(err);
    expect(normalized.kind).toBe('not-found');
  });

  it('should classify 503 as service-unavailable', () => {
    const err = new HttpErrorResponse({
      status: 503,
      statusText: 'Service Unavailable',
      error: { title: 'Service unavailable' }
    });

    const normalized = normalizeApiError(err);
    expect(normalized.kind).toBe('service-unavailable');
  });

  it('should classify status 0 as offline', () => {
    const err = new HttpErrorResponse({
      status: 0,
      statusText: 'Unknown Error',
      error: 'Network error'
    });

    const normalized = normalizeApiError(err);
    expect(normalized.kind).toBe('offline');
  });
});

