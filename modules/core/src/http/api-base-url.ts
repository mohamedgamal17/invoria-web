import { InjectionToken, type Provider } from '@angular/core';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => 'http://localhost:5000/'
});

export function provideApiBaseUrl(apiBaseUrl: string): Provider {
  return { provide: API_BASE_URL, useValue: apiBaseUrl };
}

export function normalizeApiBaseUrl(apiBaseUrl: string): string {
  return (apiBaseUrl ?? '').trim().replace(/\/?$/, '/');
}
