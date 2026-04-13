import { describe, it, expect } from 'vitest';

import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { apiResponseInterceptor } from './api-response.interceptor';

describe('apiResponseInterceptor', () => {
  it('should turn 204 No Content into an error for API requests', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiResponseInterceptor])),
        provideHttpClientTesting()
      ]
    });

    const http = TestBed.inject(HttpClient);
    const ctrl = TestBed.inject(HttpTestingController);

    let seenError: unknown;
    http.get('https://localhost:7012/customers').subscribe({
      next: () => {},
      error: (e) => {
        seenError = e;
      }
    });

    const req = ctrl.expectOne('https://localhost:7012/customers');
    req.flush(null, { status: 204, statusText: 'No Content' });
    ctrl.verify();

    expect(seenError).toBeTruthy();
    expect(seenError).toBeInstanceOf(Error);
    expect((seenError as Error).message).toMatch(/Empty response/i);
  });
});

