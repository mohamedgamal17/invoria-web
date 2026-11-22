# @invoria/core

The `@invoria/core` package provides the foundational HTTP communication layer, base entity and paging models, and global application services for Invoria Web.

## Public API Surface

### 1. HTTP Infrastructure
- `apiResponseInterceptor`: Angular HTTP interceptor (`HttpInterceptorFn`) enforcing standard `ApiResponse<T>` envelopes, normalizing validation and HTTP errors, and rejecting empty 204 responses on API endpoints.
- `API_BASE_URL`: Injection token representing the base backend API URL. Defaults to `http://localhost:5000/`.
- `provideApiBaseUrl(url: string)`: Provider helper to supply the API base URL from the shell application environment.
- `normalizeApiBaseUrl(url: string)`: Utility ensuring the URL has a clean trailing slash without extra spaces.

### 2. Base Domain Models
- `ApiResponse<T>`: Standard envelope interface returned by all backend endpoints (`result?: T`, `isSuccess: boolean`, `error?: ApiNormalizedError`).
- `Paging<T>`: Standard paged data envelope (`items: T[]`, `totalCount: number`).
- `Entity`: Base interface for entities containing `id: string`.

### 3. Error Handling
- `ApiHttpError`: Typed JavaScript Error class wrapping a normalized API error.
- `ApiEmptyResponseError`: Specialized error when an endpoint returns 204 or null body.
- `normalizeApiError(error: unknown)`: Normalizes HttpErrorResponse or JS errors into a predictable `ApiNormalizedError`.
- `presentApiError(error: unknown)`: Formats error details for UI consumption (toasts/alerts).

### 4. Global Services
- `ThemeService`: Signal-based theme service toggling light/dark mode and syncing with document root and `localStorage`.
- `NavigationLoadingService`: Tracks route transition states.

## Integration Guide

```typescript
import {
  API_BASE_URL,
  provideApiBaseUrl,
  apiResponseInterceptor,
  type ApiResponse,
  type Paging,
  type Entity
} from '@invoria/core';
```

In the shell's `app.config.ts`:
```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([apiResponseInterceptor])),
    provideApiBaseUrl(environment.apiUrl),
    // ...
  ]
};
```
