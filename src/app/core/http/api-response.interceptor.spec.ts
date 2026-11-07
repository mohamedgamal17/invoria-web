import { describe, it, expect } from 'vitest';

import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { apiResponseInterceptor } from './api-response.interceptor';
import { environment } from '../../../environments/environment';

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
    const apiUrl = `${environment.apiUrl.replace(/\s+/g, '').replace(/\/+$/, '')}/customers`;

    let seenError: unknown;
    http.get(apiUrl).subscribe({
      next: () => {},
      error: (e) => {
        seenError = e;
      }
    });

    const req = ctrl.expectOne(apiUrl);
    req.flush(null, { status: 204, statusText: 'No Content' });
    ctrl.verify();

    expect(seenError).toBeTruthy();
    expect(seenError).toBeInstanceOf(Error);
    expect((seenError as Error).message).toMatch(/Empty response/i);
  });

  it('should normalize raw error payloads on 200 envelope failures', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiResponseInterceptor])),
        provideHttpClientTesting()
      ]
    });

    const http = TestBed.inject(HttpClient);
    const ctrl = TestBed.inject(HttpTestingController);
    const apiUrl = `${environment.apiUrl.replace(/\s+/g, '').replace(/\/+$/, '')}/customers`;

    type Envelope = { isSuccess: boolean; error?: unknown };
    let body: Envelope | undefined;
    http.get<Envelope>(apiUrl).subscribe((res) => {
      body = res;
    });

    const req = ctrl.expectOne(apiUrl);
    req.flush({ isSuccess: false, error: 'boom' });
    ctrl.verify();

    expect(body?.isSuccess).toBe(false);
    const err = body?.error as { kind?: string; title?: string; detail?: string };
    expect(err.kind).toBe('api');
    expect(err.title).toBe('Request failed');
    expect(err.detail).toBe('boom');
  });
});

