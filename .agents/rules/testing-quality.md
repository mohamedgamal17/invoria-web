# Testing Conventions & Quality Standards

This rule defines testing conventions, assertion patterns, mocking guidelines, and test execution for **Invoria Web**.

---

## 1. Test Runner & Environment

- **Runner**: **Vitest** (via `@angular/build` and `ng test`). Do not use Karma or Jasmine.
- **Environment**: jsdom with Angular `TestBed`.
- **Command (Full Suite)**: `ng test`
- **Command (Focused Feature)**:
  ```bash
  npx ng test --watch=false --include="src/app/features/<feature>/**/*.spec.ts"
  ```

---

## 2. API Service Unit Testing

For all `*-api.service.spec.ts` files:
1. **Providers**: Use `provideHttpClient()` and `provideHttpClientTesting()`.
2. **Controller**: Inject `HttpTestingController` and verify requests using `httpTestingController.expectOne(...)`.
3. **Contract Verification**: Assert the complete HTTP contract:
   - Request URL and endpoint path.
   - HTTP method (`GET`, `POST`, `PUT`, `DELETE`).
   - Query string parameters (especially paging `skip` and `length`, and filters `name`).
   - Request body payload structure.
4. **Clean Exit**: Always call `httpTestingController.verify()` in `afterEach()` to guarantee no unhandled requests remain.

```ts
it('should request customer list with paging parameters', () => {
  const request = { skip: 0, length: 25, name: 'Acme' };
  service.list(request).subscribe();

  const testRequest = httpTestingController.expectOne(
    candidate => candidate.url.includes('/api/customers') &&
      candidate.params.get('skip') === '0' &&
      candidate.params.get('length') === '25' &&
      candidate.params.get('name') === 'Acme'
  );
  expect(testRequest.request.method).toBe('GET');
  testRequest.flush({ isSuccess: true, result: mockPagingResult });
});
```

---

## 3. Smart Container Page Testing

For smart container component specs (e.g., `customers-page.component.spec.ts`):
1. **Mock All Services**: Never permit real HTTP calls from page tests. Provide mocked API services using `vi.fn().mockReturnValue(of(...))`.
2. **Route Parameter Driving**:
   - Provide `ActivatedRoute` backed by a `BehaviorSubject(convertToParamMap({ page: '1', pageSize: '25' }))`.
   - To test paging or search transitions, push new param maps to the subject; verify signal and store recomputations.
3. **Decoupled Container Specs**:
   - Use `NO_ERRORS_SCHEMA` or override the page template when testing container logic to prevent coupling to presentational child components.
   - Overriding page templates with `template: ''` is the only approved exception for inline templates.
4. **Dialog Confirmation Testing**:
   - Provide `ConfirmDialogService` stubbed with `vi.fn().mockReturnValue(of(true))` or `of(false)`. Never mock raw PrimeNG `ConfirmationService`.

---

## 4. Signal-Driven Component Testing

When testing pages using the Signals pattern (`rxResource`, `linkedSignal`):
- Drive changes through the mocked `ActivatedRoute` query parameter subject.
- Ensure `TestBed.flushEffects()` or component fixture changes trigger signal recomputations.
- Test both loading states (`resource.isLoading() === true`) and error states via mock rejections.

---

## 5. Orders Feature Testing Standards

For tests located under `src/app/features/orders/`:
- Map test concerns following backend Ordering application layers (Domain, Integration, Infrastructure, Assertions).
- Avoid deep form coupling in `order-form-page.component.spec.ts` by stubbing complex PrimeNG Tabs and `ResizeObserver` mocks in jsdom.
- Run orders specs directly:
  ```bash
  npx ng test --watch=false --include="src/app/features/orders/**/*.spec.ts"
  ```

---

## 6. Code Quality in Tests

- **Naming Standards Apply to Tests**: The ban on single-character identifiers strictly applies to spec files.
  - ❌ BAD: `const f = TestBed.createComponent(...);`, `it('...', (done) => ...)`
  - ✅ GOOD: `const fixture = TestBed.createComponent(...);`, `const component = fixture.componentInstance;`
- **Meaningful Assertions**: Avoid vacuous assertions like `expect(component).toBeTruthy()`. Assert state transitions, emitted outputs, and navigation calls.
