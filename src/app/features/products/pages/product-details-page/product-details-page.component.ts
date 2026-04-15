import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, map, take } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';

import { formatApiError } from '../../../../core/http/api-error.format';
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
    TagModule,
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
  readonly error = signal('');
  readonly product = signal<Product | null>(null);

  readonly breadcrumbItems = computed(() => {
    const p = this.product();
    const label = p ? p.name.trim() || p.code : 'Product';
    return [
      { label: 'Products', routerLink: ['/dashboard', 'products'] as string[] },
      { label }
    ];
  });

  constructor() {
    this.loadProduct();
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
    if (!p) {
      return;
    }
    this.confirmationService.confirm({
      header: 'Delete Product',
      message: `Are you sure you want to delete "${p.name}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.productsApi
          .deleteProduct(p.id)
          .pipe(take(1))
          .subscribe({
            next: (res) => {
              if (!res.isSuccess) {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: formatApiError(res.error)
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
              this.messageService.add({ severity: 'error', summary: 'Error', detail: formatApiError(err) });
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
      this.error.set('Missing product id.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.productsApi
      .getProduct(id)
      .pipe(
        take(1),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (res) => {
          if (!res.isSuccess || !res.result) {
            this.error.set(formatApiError(res.error));
            return;
          }
          this.product.set(res.result);
        },
        error: (err: unknown) => {
          this.error.set(formatApiError(err));
        }
      });
  }
}
