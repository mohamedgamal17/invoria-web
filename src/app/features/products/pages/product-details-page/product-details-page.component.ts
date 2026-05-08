import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, map, take } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { presentApiError } from '../../../../core/http/api-error.presenter';
import { ProductsBreadcrumbComponent } from '../../components/products-breadcrumb/products-breadcrumb.component';
import type { Product } from '../../models/product.entity';
import { ProductsApiService } from '../../services/products-api.service';

@Component({
  selector: 'app-product-details-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    SkeletonModule,
    ProductsBreadcrumbComponent
  ],
  templateUrl: './product-details-page.component.html'
})
export class ProductDetailsPageComponent {
  private readonly productsApi = inject(ProductsApiService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly productId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' }
  );

  readonly loading = signal(true);
  readonly deleting = signal(false);
  readonly error = signal('');
  readonly product = signal<Product | null>(null);
  readonly hasProduct = computed(() => !!this.product());
  readonly actionsDisabled = computed(
    () => this.loading() || this.deleting() || !!this.error() || !this.hasProduct()
  );

  readonly breadcrumbItems = computed(() => {
    const p = this.product();
    const label = p ? p.name.trim() || 'Product' : 'Product';
    return [
      { label: 'Products', routerLink: ['/dashboard', 'products'] as string[] },
      { label }
    ];
  });

  constructor() {
    effect(() => {
      this.loadProduct(this.productId());
    });
  }

  backToList(): void {
    void this.router.navigate(['/dashboard', 'products']);
  }

  goToEdit(): void {
    void this.router.navigate(['edit'], { relativeTo: this.route });
  }

  openBatches(): void {
    void this.router.navigate(['batches'], { relativeTo: this.route });
  }

  deleteProduct(): void {
    const p = this.product();
    if (!p || this.deleting()) {
      return;
    }
    this.confirmationService.confirm({
      header: 'Delete Product',
      message: `Are you sure you want to delete "${p.name}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleting.set(true);
        this.productsApi
          .deleteProduct(p.id)
          .pipe(
            take(1),
            finalize(() => this.deleting.set(false))
          )
          .subscribe({
            next: (res) => {
              if (!res.isSuccess) {
                const presentation = presentApiError(res.error);
                this.messageService.add({
                  ...presentation.toast,
                  detail: `Could not delete product. ${presentation.toast.detail}`
                });
                return;
              }
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Product deleted successfully.'
              });
              void this.router.navigate(['/dashboard', 'products']);
            },
            error: (err: unknown) => {
              const presentation = presentApiError(err);
              this.messageService.add({
                ...presentation.toast,
                detail: `Could not delete product. ${presentation.toast.detail}`
              });
            }
          });
      }
    });
  }

  retry(): void {
    this.loadProduct();
  }

  private loadProduct(idParam?: string): void {
    const id = idParam ?? this.productId();
    if (!id) {
      this.loading.set(false);
      this.product.set(null);
      this.error.set('Product id is missing from the route.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.product.set(null);
    this.productsApi
      .getProduct(id)
      .pipe(
        take(1),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (res) => {
          if (!res.isSuccess || !res.result) {
            const presentation = presentApiError(res.error);
            this.error.set(`Could not load product details. ${presentation.toast.detail}`);
            if (presentation.routeTarget) {
              void this.router.navigate([presentation.routeTarget]);
            }
            return;
          }
          this.product.set(res.result);
        },
        error: (err: unknown) => {
          const presentation = presentApiError(err);
          this.error.set(`Could not load product details. ${presentation.toast.detail}`);
          if (presentation.routeTarget) {
            void this.router.navigate([presentation.routeTarget]);
          }
        }
      });
  }
}
