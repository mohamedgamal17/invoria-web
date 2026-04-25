import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, take } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';

import { presentApiError } from '../../../../core/http/api-error.presenter';
import { ProductsBreadcrumbComponent } from '../../components/products-breadcrumb/products-breadcrumb.component';
import { ProductsApiService } from '../../services/products-api.service';
import type { CreateProductRequest } from '../../models/create-product.request';
import type { UpdateProductRequest } from '../../models/update-product.request';

@Component({
  selector: 'app-product-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    MessageModule,
    ProductsBreadcrumbComponent
  ],
  templateUrl: './product-form-page.component.html'
})
export class ProductFormPageComponent {
  private readonly productsApi = inject(ProductsApiService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);

  readonly mode = computed<'create' | 'edit'>(() =>
    this.route.snapshot.data['mode'] === 'edit' ? 'edit' : 'create'
  );

  readonly productId = computed(() => this.route.snapshot.paramMap.get('id'));

  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly form = this.formBuilder.group({
    name: this.formBuilder.nonNullable.control('', [Validators.required, Validators.maxLength(120)]),
    code: this.formBuilder.nonNullable.control('', [Validators.required, Validators.maxLength(40)]),
    price: this.formBuilder.nonNullable.control(0, [Validators.required, Validators.min(0.01)])
  });

  readonly breadcrumbItems = computed(() => {
    const m = this.mode();
    if (m === 'create') {
      return [
        { label: 'Products', routerLink: ['/products'] as string[] },
        { label: 'Create' }
      ];
    }
    const name = this.loadedName();
    return [
      { label: 'Products', routerLink: ['/products'] as string[] },
      { label: name || 'Product', routerLink: ['/products', this.productId() ?? ''] },
      { label: 'Edit' }
    ];
  });

  private readonly loadedName = signal('');

  constructor() {
    if (this.mode() === 'edit' && this.productId()) {
      this.loadProduct(this.productId() as string);
    }
  }

  goBack(): void {
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
    const body: CreateProductRequest = {
      Name: raw.name.trim(),
      Code: raw.code.trim(),
      Price: raw.price
    };

    this.saving.set(true);
    const currentMode = this.mode();
    const id = this.productId();

    if (currentMode === 'create') {
      this.productsApi
        .createProduct(body)
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
              detail: 'Product created successfully.'
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

    this.productsApi
      .updateProduct(id, body satisfies UpdateProductRequest)
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
            detail: 'Product updated successfully.'
          });
          void this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: (err: unknown) => {
          this.messageService.add({ ...presentApiError(err).toast });
        }
      });
  }

  private loadProduct(id: string): void {
    this.loading.set(true);
    this.productsApi
      .getProduct(id)
      .pipe(take(1), finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          if (!res.isSuccess || !res.result) {
            this.messageService.add({
              ...presentApiError(res.error).toast
            });
            void this.router.navigate(['/products']);
            return;
          }
          const p = res.result;
          this.loadedName.set(p.name);
          this.form.reset({
            name: p.name,
            code: p.code,
            price: p.price
          });
        },
        error: (err: unknown) => {
          this.messageService.add({ ...presentApiError(err).toast });
          void this.router.navigate(['/products']);
        }
      });
  }
}
