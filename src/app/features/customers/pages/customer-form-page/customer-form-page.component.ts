import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, take } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { presentApiError } from '../../../../core/http/api-error.presenter';
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
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './customer-form-page.component.html'
})
export class CustomerFormPageComponent {
  private readonly customersApi = inject(CustomersApiService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);

  readonly mode = computed<'create' | 'edit'>(() =>
    this.route.snapshot.data['mode'] === 'edit' ? 'edit' : 'create'
  );

  readonly customerId = computed(() => this.route.snapshot.paramMap.get('id'));

  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly form = this.formBuilder.group({
    name: this.formBuilder.nonNullable.control('', [Validators.required, Validators.maxLength(120)])
  });

  constructor() {
    if (this.mode() === 'edit' && this.customerId()) {
      this.loadCustomer(this.customerId() as string);
    }
  }

  goBack(): void {
    if (this.mode() === 'create') {
      void this.router.navigate(['/dashboard', 'customers']);
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

    this.saving.set(true);
    const currentMode = this.mode();
    const id = this.customerId();

    if (currentMode === 'create') {
      this.customersApi
        .createCustomer(body)
        .pipe(
          take(1),
          finalize(() => this.saving.set(false))
        )
        .subscribe({
          next: (res) => {
            if (!res.isSuccess || res.result === undefined) {
              this.messageService.add({
                ...presentApiError(res.error).toast
              });
              return;
            }
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Customer created successfully.'
            });
            void this.router.navigate([res.result.id], { relativeTo: this.route.parent });
          },
          error: (err: unknown) => {
            this.messageService.add({ ...presentApiError(err).toast });
          }
        });
      return;
    }

    if (!id) {
      this.saving.set(false);
      return;
    }

    this.customersApi
      .updateCustomer(id, body satisfies UpdateCustomerRequest)
      .pipe(
        take(1),
        finalize(() => this.saving.set(false))
      )
      .subscribe({
        next: (res) => {
          if (!res.isSuccess || res.result === undefined) {
            this.messageService.add({
              ...presentApiError(res.error).toast
            });
            return;
          }
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Customer updated successfully.'
          });
          void this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: (err: unknown) => {
          this.messageService.add({ ...presentApiError(err).toast });
        }
      });
  }

  private loadCustomer(id: string): void {
    this.loading.set(true);
    this.customersApi
      .getCustomer(id)
      .pipe(
        take(1),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (res) => {
          if (!res.isSuccess || !res.result) {
            this.messageService.add({
              ...presentApiError(res.error).toast
            });
            void this.router.navigate(['/dashboard', 'customers']);
            return;
          }
          const c = res.result;
          this.form.reset({ name: c.name });
        },
        error: (err: unknown) => {
          this.messageService.add({ ...presentApiError(err).toast });
          void this.router.navigate(['/dashboard', 'customers']);
        }
      });
  }
}

