import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, take } from 'rxjs';

import { Store } from '@ngrx/store';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { presentApiError } from '@invoria/core';
import { LOAD_STATUS } from '@invoria/utils';
import { CUSTOMER_MUTATIONS_ACTIONS } from '@invoria/customers/store/customer-mutations/customer-mutations.actions';
import { customerMutationsFeature } from '@invoria/customers/store/customer-mutations/customer-mutations.reducer';
import { CustomersApiService } from '@invoria/customers/services/customers-api.service';
import type { CustomerRequest } from '@invoria/customers/models/customer-request';

@Component({
  selector: 'app-customer-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    MessageModule,
    ToastModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './customer-form-page.component.html',
})
export class CustomerFormPageComponent {
  private readonly store = inject(Store);
  private readonly customersApi = inject(CustomersApiService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);

  readonly mode = computed<'create' | 'edit'>(() =>
    this.route.snapshot.data['mode'] === 'edit' ? 'edit' : 'create',
  );

  readonly customerId = computed(() => this.route.snapshot.paramMap.get('id'));

  readonly loading = signal(false);
  private readonly createRequest = this.store.selectSignal(
    customerMutationsFeature.selectCreateRequest,
  );
  private readonly updateRequest = this.store.selectSignal(
    customerMutationsFeature.selectUpdateRequest,
  );

  /** Saving state is owned by the store: create/update put their request in flight. */
  readonly saving = computed(
    () =>
      this.createRequest().status === LOAD_STATUS.Loading ||
      this.updateRequest().status === LOAD_STATUS.Loading,
  );

  readonly form = this.formBuilder.group({
    name: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(120),
    ]),
  });

  constructor() {
    if (this.mode() === 'edit' && this.customerId()) {
      this.loadCustomer(this.customerId() as string);
    }
  }

  goBack(): void {
    if (this.mode() === 'create') {
      void this.router.navigate(['/customers']);
      return;
    }
    void this.router.navigate(['../'], { relativeTo: this.route });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.saving()) {
      return;
    }

    const raw = this.form.getRawValue();
    const body: CustomerRequest = { name: raw.name.trim() };

    if (this.mode() === 'create') {
      this.store.dispatch(CUSTOMER_MUTATIONS_ACTIONS.createCustomer({ request: body }));
      return;
    }

    const id = this.customerId();
    if (!id) {
      return;
    }

    this.store.dispatch(
      CUSTOMER_MUTATIONS_ACTIONS.updateCustomer({
        id,
        request: body,
      }),
    );
  }

  private loadCustomer(id: string): void {
    this.loading.set(true);
    this.customersApi
      .getCustomer(id)
      .pipe(
        take(1),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (response) => {
          if (!response.isSuccess || !response.result) {
            this.messageService.add({
              ...presentApiError(response.error).toast,
            });
            void this.router.navigate(['/customers']);
            return;
          }
          const customerResult = response.result;
          this.form.reset({ name: customerResult.name });
        },
        error: (error: unknown) => {
          this.messageService.add({ ...presentApiError(error).toast });
          void this.router.navigate(['/customers']);
        },
      });
  }
}
