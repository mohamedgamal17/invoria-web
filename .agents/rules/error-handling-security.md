# Error Handling & Security Best Practices

This rule outlines error handling protocols, logging policies, and client-side security standards for **Invoria Web**.

---

## 1. Unified Error Handling Architecture

Invoria Web handles API errors through two standard pathways depending on the state management model:

### 1. NgRx Error Pathway (Complex State)
- Effects unwrap the `ApiResponse<T>`:
  - When `response.isSuccess === false` or an HTTP exception is caught:
  - Dispatch `<FEATURE>_ACTIONS.loadFailure({ error })` to update the slice's `AsyncRequestState`.
  - Dispatch `APP_ERROR_ACTIONS.apiError({ error })` to trigger global error presentation.
- The global `AppErrorEffects` (`src/app/shared/store/app-error.effects.ts`) listens to `apiError` and displays an application-wide toast via `MessageService`, routing to error pages if critical.
- Pure reducers apply `applyFailure(state, error)` from `src/app/shared/models/async-request-state.ts`, which increments `failureNonce` and clears `fetchedQuery`.

### 2. Signals Error Pathway (Simple State)
- Signals pages provide `MessageService` in their component `providers` list:
  ```ts
  @Component({
    providers: [MessageService],
    ...
  })
  ```
- Catch and present API failures using `presentApiError(error, messageService)` from `src/app/core/http/present-api-error.ts`.
- Never swallow exceptions silently in catch blocks or `subscribe({ error: () => {} })`.

---

## 2. API Response Contract

All backend responses adhere to the standard `ApiResponse<T>` envelope:
```ts
export interface ApiResponse<T> {
  result: T;
  isSuccess: boolean;
  error?: string | null;
}
```

- Always inspect `response.isSuccess` before consuming `response.result`.
- When `isSuccess` is `false`, treat the operation as failed even if the HTTP status was 200.

---

## 3. Input Validation & Defense-in-Depth

- **Client-Side Pre-Validation**: Validate user inputs before dispatching HTTP calls. If invalid parameters are passed into API services, reject immediately with `throwError(() => new Error('Validation failed'))`.
- **Reactive Form Validation**: Bind validation to PrimeNG `p-message` components. Disable or guard primary submit buttons when forms are invalid or dirty state requirements are not met.
- **Payload Normalization**: Sanitize, trim strings, and coerce numeric inputs in form handlers before sending payloads to API services.

---

## 4. Security Best Practices

1. **Cross-Site Scripting (XSS) Prevention**:
   - Rely on Angular's built-in contextual template escaping.
   - **Never use `[innerHTML]`** with unsanitized user content. If raw HTML rendering is mandatory, pass it through Angular's `DomSanitizer.sanitize()`.
2. **No Client-Side Secrets**:
   - Never store API keys, authentication secrets, private tokens, or credentials in client-side code, environment files, or repository commits.
   - Authentication tokens must be managed via secure HTTP-only cookies or standard bearer interceptors in `src/app/core/http/`.
3. **Environment Security**:
   - Dynamic environment generation is handled by `scripts/generate-production-env.mjs`.
   - Production builds require `API_URL` to be provided as an environment variable at build time. Never hardcode production API endpoints into source code.
4. **URL & Navigation Guarding**:
   - Sanitize URL query parameters (`page`, `pageSize`, `q`) using `PaginationService` parse helpers to guarantee that malformed or malicious query parameters cannot cause crashes or infinite navigation loops.
