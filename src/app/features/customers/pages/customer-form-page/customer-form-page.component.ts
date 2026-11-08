import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
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

import { presentApiError } from '../../../../core/http/api-error.presenter';
import { LOAD_STATUS } from '../../../../shared/models/load-status';
import { CUSTOMER_MUTATIONS_ACTIONS } from '../../store/customer-mutations/customer-mutations.actions';
import { customerMutationsFeature } from '../../store/customer-mutations/customer-mutations.reducer';
import { CustomersApiService } from '../../services/customers-api.service';
import type { CreateCustomerRequest } from '../../models/create-customer.request';
import type { UpdateCustomerRequest } from '../../models/update-customer.request';

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
    const body: CreateCustomerRequest = { Name: raw.name.trim() };

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
        request: body satisfies UpdateCustomerRequest,
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
        next: (res) => {
          if (!res.isSuccess || !res.result) {
            this.messageService.add({
              ...presentApiError(res.error).toast,
            });
            void this.router.navigate(['/customers']);
            return;
          }
          const c = res.result;
          this.form.reset({ name: c.name });
        },
        error: (err: unknown) => {
          this.messageService.add({ ...presentApiError(err).toast });
          void this.router.navigate(['/customers']);
        },
      });
  }
}
