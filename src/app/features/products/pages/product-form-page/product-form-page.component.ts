import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';

import { presentApiError } from '../../../../core/http/api-error.presenter';
import { LOAD_STATUS } from '../../../../shared/models/load-status';
import { PRODUCT_MUTATIONS_ACTIONS } from '../../store/products-mutations/products-mutations.actions';
import { productsMutationsFeature } from '../../store/products-mutations/products-mutations.reducer';
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
    ProductsBreadcrumbComponent,
  ],
  templateUrl: './product-form-page.component.html',
})
export class ProductFormPageComponent {
  private readonly store = inject(Store);
  private readonly productsApi = inject(ProductsApiService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);

  readonly mode = computed<'create' | 'edit'>(() =>
    this.route.snapshot.data['mode'] === 'edit' ? 'edit' : 'create',
  );

  readonly productId = computed(() => this.route.snapshot.paramMap.get('id'));

  readonly loading = signal(false);
  private readonly createRequest = this.store.selectSignal(
    productsMutationsFeature.selectCreateRequest,
  );
  private readonly updateRequest = this.store.selectSignal(
    productsMutationsFeature.selectUpdateRequest,
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
    price: this.formBuilder.nonNullable.control(0, [Validators.required, Validators.min(0.01)]),
  });

  readonly breadcrumbItems = computed(() => {
    const mode = this.mode();
    if (mode === 'create') {
      return [{ label: 'Products', routerLink: ['/products'] as string[] }, { label: 'Create' }];
    }
    const name = this.loadedName();
    return [
      { label: 'Products', routerLink: ['/products'] as string[] },
      { label: name || 'Product', routerLink: ['/products', this.productId() ?? ''] },
      { label: 'Edit' },
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
      Price: raw.price,
    };

    if (this.mode() === 'create') {
      this.store.dispatch(PRODUCT_MUTATIONS_ACTIONS.createProduct({ request: body }));
      return;
    }

    const id = this.productId();
    if (!id) {
      return;
    }

    this.store.dispatch(
      PRODUCT_MUTATIONS_ACTIONS.updateProduct({
        id,
        request: body satisfies UpdateProductRequest,
      }),
    );
  }

  private loadProduct(id: string): void {
    this.loading.set(true);
    this.productsApi
      .getProduct(id)
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
            void this.router.navigate(['/products']);
            return;
          }
          const productResult = res.result;
          this.loadedName.set(productResult.name);
          this.form.reset({
            name: productResult.name,
            price: productResult.price,
          });
        },
        error: (err: unknown) => {
          this.messageService.add({ ...presentApiError(err).toast });
          void this.router.navigate(['/products']);
        },
      });
  }
}
