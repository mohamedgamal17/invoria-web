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
import { SuppliersApiService } from '../../services/suppliers-api.service';
import type { CreateSupplierRequest } from '../../models/create-supplier.request';
import type { UpdateSupplierRequest } from '../../models/update-supplier.request';

/** Matches backend SupplierTableConsts / FluentValidation. */
const SUPPLIER_CODE_MAX = 128;
const NAME_MAX = 512;
const NAME_MIN = 3;
const EMAIL_MAX = 256;
const PHONE_MAX = 64;

@Component({
  selector: 'app-supplier-form-page',
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
  templateUrl: './supplier-form-page.component.html'
})
export class SupplierFormPageComponent {
  private readonly suppliersApi = inject(SuppliersApiService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);

  readonly mode = computed<'create' | 'edit'>(() =>
    this.route.snapshot.data['mode'] === 'edit' ? 'edit' : 'create'
  );

  readonly supplierId = computed(() => this.route.snapshot.paramMap.get('id'));

  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly form = this.formBuilder.group({
    supplierCode: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(SUPPLIER_CODE_MAX)
    ]),
    name: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.minLength(NAME_MIN),
      Validators.maxLength(NAME_MAX)
    ]),
    contactEmail: this.formBuilder.nonNullable.control('', [
      Validators.maxLength(EMAIL_MAX),
      Validators.pattern(/^$|^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)
    ]),
    phone: this.formBuilder.nonNullable.control('', [Validators.maxLength(PHONE_MAX)])
  });

  constructor() {
    if (this.mode() === 'edit' && this.supplierId()) {
      this.loadSupplier(this.supplierId() as string);
    }
  }

  goBack(): void {
    if (this.mode() === 'create') {
      void this.router.navigate(['/dashboard', 'suppliers']);
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
    const emailTrim = raw.contactEmail.trim();
    const phoneTrim = raw.phone.trim();
    const body: CreateSupplierRequest = {
      SupplierCode: raw.supplierCode.trim(),
      Name: raw.name.trim(),
      ContactEmail: emailTrim ? emailTrim : null,
      Phone: phoneTrim ? phoneTrim : null
    };

    this.saving.set(true);
    const currentMode = this.mode();
    const id = this.supplierId();

    if (currentMode === 'create') {
      this.suppliersApi
        .createSupplier(body)
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
              detail: 'Supplier created successfully.'
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

    this.suppliersApi
      .updateSupplier(id, body satisfies UpdateSupplierRequest)
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
            detail: 'Supplier updated successfully.'
          });
          void this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: (err: unknown) => {
          this.messageService.add({ ...presentApiError(err).toast });
        }
      });
  }

  private loadSupplier(id: string): void {
    this.loading.set(true);
    this.suppliersApi
      .getSupplier(id)
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
            void this.router.navigate(['/dashboard', 'suppliers']);
            return;
          }
          const s = res.result;
          this.form.reset({
            supplierCode: s.supplierCode,
            name: s.name,
            contactEmail: s.contactEmail ?? '',
            phone: s.phone ?? ''
          });
        },
        error: (err: unknown) => {
          this.messageService.add({ ...presentApiError(err).toast });
          void this.router.navigate(['/dashboard', 'suppliers']);
        }
      });
  }
}
