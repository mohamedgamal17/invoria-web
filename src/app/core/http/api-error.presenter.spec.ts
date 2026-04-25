import { describe, expect, it } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';

import { presentApiError } from './api-error.presenter';

describe('presentApiError', () => {
  it('returns route target for not found', () => {
    const error = new HttpErrorResponse({
      status: 404,
      error: { title: 'Not Found' }
    });

    const presentation = presentApiError(error);
    expect(presentation.routeTarget).toBe('/not-found');
    expect(presentation.toast.severity).toBe('error');
  });

  it('returns route target for offline', () => {
    const error = new HttpErrorResponse({
      status: 0,
      error: 'Network error'
    });

    const presentation = presentApiError(error);
    expect(presentation.routeTarget).toBe('/service-unavailable');
  });

  it('uses validation toast semantics', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: {
        title: 'Validation failed',
        errors: { Name: ['Name is required.'] }
      }
    });

    const presentation = presentApiError(error);
    expect(presentation.toast.severity).toBe('warn');
    expect(presentation.toast.summary).toBe('Validation');
    expect(presentation.routeTarget).toBeUndefined();
  });
});

