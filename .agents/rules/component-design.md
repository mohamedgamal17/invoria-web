# Component Design & Authoring Rules

This rule defines component architecture, template conventions, form patterns, and UI encapsulation standards for **Invoria Web**.

---

## 1. Smart (Container) vs. Presentational (Dumb) Split

The application strictly separates orchestration from presentation:

### Smart Components (`pages/` directory)
- **Role**: Route targets and feature coordinators.
- **Responsibilities**:
  - Connect to state layers (NgRx `Store` for complex pages, component-local signals for simple ones).
  - Act as the URL write adapter: sync user interactions (`onPageChange`, `onFiltersChange`) to router navigation (`queryParamsHandling: 'merge'`).
  - Coordinate modal visibility and trigger API operations.
  - Pass read-only signals and event handlers to child components.
- **Constraints**: Keep template logic thin; delegate visual layout, table rendering, and form fields to child components.

### Presentational Components (`components/` directory)
- **Role**: Pure UI/UX rendering and user intent emission.
- **Signal-Driven I/O**:
  - Inputs: `input<T>()`, `input.required<T>()`
  - Outputs: `output<T>()`
  - Two-way binding: `model<T>()`
  - Legacy `@Input()` and `@Output()` decorators are prohibited in new and refactored code.
- **Strict Injection Ban**:
  - **Never inject typed API services** (e.g. `CustomersApiService`).
  - **Never inject `Router` or `ActivatedRoute`**.
  - **Never inject `MessageService`**.
  - Any user interaction requiring an API call or navigation must emit an `output()` event for the smart page to handle.

---

## 2. External Templates Required

- **Rule**: Every production component must use an external template file:
  ```ts
  @Component({
    selector: 'app-customer-list',
    standalone: true,
    imports: [...],
    templateUrl: './customer-list.component.html',
  })
  ```
- **Prohibition**: Never use the inline `template:` string property in production components.
- **Exemption**: Inline templates are permitted only for throwaway spec stubs in `*.spec.ts` files (e.g., test host components with `template: ''`).

---

## 3. Reactive Forms Standards

- **Reactive Forms Only**: All non-trivial forms must use Angular Reactive Forms (`FormGroup`, `FormControl`, `FormArray`, `Validators`).
- **Prohibition on `[(ngModel)]`**: Never use `ngModel` in features or presentational forms.
- **No In-Place Mutation**: Never mutate input arrays or model values directly; construct new immutable values.
- **Form Component Architecture**:
  - Presentational form components accept initial values via `input()` and build a typed `FormGroup`.
  - On submit, emit a plain domain payload via `output<T>()` (e.g., `output<OrderFormSubmitEvent>()`), never the raw `FormGroup` instance.
  - The owning smart page executes the API mutation and manages navigation upon success.
- **Submit Safety**:
  - Use `(ngSubmit)="onSubmit($event)"` with `event.preventDefault()` to stop browser reloads.
  - Set the primary submit action to `type="button"` with `(onClick)` or guard validation inline to prevent double-submits.
- **Custom Form Controls**:
  - Custom inputs (e.g., `app-autosearch`) must implement `ControlValueAccessor` (CVA).
  - Consume them cleanly with `formControlName` inside form groups.

---

## 4. Confirmation Dialogs via `ConfirmDialogService`

- **Single Global Host**: A single `<app-confirm-dialog />` resides in `app.html` backed by root-provided `ConfirmationService`.
- **Prohibition**: Never render `<p-confirmDialog>` or inject `ConfirmationService` directly in feature components.
- **Standard API**: Inject the shared `ConfirmDialogService` from `src/app/shared/ui/confirm-dialog/confirm-dialog.service.ts`:
  ```ts
  private readonly confirmDialogService = inject(ConfirmDialogService);

  onDeleteCustomer(customer: Customer): void {
    this.confirmDialogService
      .confirm({
        header: 'Delete Customer',
        message: `Are you sure you want to delete "${customer.name}"?`,
        severity: 'danger',
        acceptLabel: 'Delete'
      })
      .subscribe(accepted => {
        if (accepted) {
          this.store.dispatch(CUSTOMERS_ACTIONS.deleteCustomer({ id: customer.id }));
        }
      });
  }
  ```
- **Severity Guidelines**:
  - Destructive operations (delete, cancel): pass `severity: 'danger'` and explicit `acceptLabel: 'Delete'`.
  - Non-destructive confirmations: use default severity and labels.
- **Unit Testing**: In specs, mock `ConfirmDialogService` with `{ confirm: vi.fn().mockReturnValue(of(true)) }`.
