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
import { SUPPLIER_MUTATIONS_ACTIONS } from '@invoria/procurement/suppliers/store/supplier-mutations/supplier-mutations.actions';
import { supplierMutationsFeature } from '@invoria/procurement/suppliers/store/supplier-mutations/supplier-mutations.reducer';
import { SuppliersApiService } from '@invoria/procurement/suppliers/services/suppliers-api.service';
import type { SupplierRequest } from '@invoria/procurement/suppliers/models/supplier-request';

/** Matches backend SupplierTableConsts / FluentValidation. */
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
    ToastModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './supplier-form-page.component.html',
})
export class SupplierFormPageComponent {
  private readonly store = inject(Store);
  private readonly suppliersApi = inject(SuppliersApiService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);

  readonly mode = computed<'create' | 'edit'>(() =>
    this.route.snapshot.data['mode'] === 'edit' ? 'edit' : 'create',
  );

  readonly supplierId = computed(() => this.route.snapshot.paramMap.get('id'));

  readonly loading = signal(false);
  private readonly createRequest = this.store.selectSignal(
    supplierMutationsFeature.selectCreateRequest,
  );
  private readonly updateRequest = this.store.selectSignal(
    supplierMutationsFeature.selectUpdateRequest,
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
      Validators.minLength(NAME_MIN),
      Validators.maxLength(NAME_MAX),
    ]),
    contactEmail: this.formBuilder.nonNullable.control('', [
      Validators.maxLength(EMAIL_MAX),
      Validators.pattern(/^$|^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i),
    ]),
    phone: this.formBuilder.nonNullable.control('', [Validators.maxLength(PHONE_MAX)]),
  });

  constructor() {
    effect(() => {
      if (this.saving()) {
        this.form.disable({ emitEvent: false });
      } else {
        this.form.enable({ emitEvent: false });
      }
    });

    if (this.mode() === 'edit' && this.supplierId()) {
      this.loadSupplier(this.supplierId() as string);
    }
  }

  goBack(): void {
    if (this.mode() === 'create') {
      void this.router.navigate(['/suppliers']);
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
    const body: SupplierRequest = {
      name: raw.name.trim(),
      contactEmail: emailTrim ? emailTrim : null,
      phone: phoneTrim ? phoneTrim : null,
    };

    if (this.mode() === 'create') {
      this.store.dispatch(SUPPLIER_MUTATIONS_ACTIONS.createSupplier({ request: body }));
      return;
    }

    const id = this.supplierId();
    if (!id) {
      return;
    }

    this.store.dispatch(
      SUPPLIER_MUTATIONS_ACTIONS.updateSupplier({
        id,
        request: body,
      }),
    );
  }

  private loadSupplier(id: string): void {
    this.loading.set(true);
    this.suppliersApi
      .getSupplier(id)
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
            void this.router.navigate(['/suppliers']);
            return;
          }
          const supplierResult = response.result;
          this.form.reset({
            name: supplierResult.name,
            contactEmail: supplierResult.contactEmail ?? '',
            phone: supplierResult.phone ?? '',
          });
        },
        error: (error: unknown) => {
          this.messageService.add({ ...presentApiError(error).toast });
          void this.router.navigate(['/suppliers']);
        },
      });
  }
}
