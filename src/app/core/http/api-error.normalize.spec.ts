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

    const n = normalizeApiError(err);
    expect(n.status).toBe(400);
    expect(n.validationErrors?.['Name']?.[0]).toBe('Name is required.');
    expect(n.validationErrors?.['Price']?.[0]).toBe('Price must be non-negative.');
  });
});

