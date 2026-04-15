import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, map, take } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import type { PaginatorState } from 'primeng/paginator';
import type { TablePageEvent } from 'primeng/table';

import { formatApiError } from '../../../../core/http/api-error.format';
import { ProductBatchesPanelComponent } from '../../../inventory/components/product-batches-panel.component';
import type { BatchesProductRef } from '../../../inventory/models/batches-product.ref';
import { ProductsBreadcrumbComponent } from '../../components/products-breadcrumb/products-breadcrumb.component';
import type { Product } from '../../models/product.entity';
import { ProductsApiService } from '../../services/products-api.service';

@Component({
  selector: 'app-product-batches-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    SkeletonModule,
    TagModule,
    ProductsBreadcrumbComponent,
    ProductBatchesPanelComponent
  ],
  templateUrl: './product-batches-page.component.html'
})
export class ProductBatchesPageComponent {
  private readonly productsApi = inject(ProductsApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly pageSizeOptions = [25, 50, 100, 200];

  private readonly routeProductId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' }
  );

  /** 1-based page number from `?page=` (default 1). */
  private readonly pageFromRoute = toSignal(
    this.route.queryParamMap.pipe(
      map((m) => {
        const raw = m.get('page');
        const n = raw ? parseInt(raw, 10) : 1;
        return Number.isFinite(n) && n >= 1 ? n : 1;
      })
    ),
    { initialValue: 1 }
  );

  /** Page size from `?pageSize=` (must be in pageSizeOptions; default 25). */
  readonly pageSize = toSignal(
    this.route.queryParamMap.pipe(
      map((m) => {
        const raw = m.get('pageSize');
        const n = raw ? parseInt(raw, 10) : NaN;
        return this.pageSizeOptions.includes(n) ? n : 25;
      })
    ),
    { initialValue: 25 }
  );

  /** 0-based page index derived from the URL. */
  readonly pageIndex = computed(() => Math.max(0, this.pageFromRoute() - 1));

  readonly first = computed(() => this.pageIndex() * this.pageSize());

  readonly loading = signal(true);
  readonly error = signal('');
  readonly product = signal<Product | null>(null);

  readonly batchesProductRef = computed((): BatchesProductRef | null => {
    const p = this.product();
    if (!p) {
      return null;
    }
    return { id: p.id, name: p.name, code: p.code };
  });

  readonly breadcrumbItems = computed(() => {
    const p = this.product();
    const id = this.routeProductId();
    const label = p ? p.name.trim() || p.code : 'Product';
    const base = ['/dashboard', 'products'] as string[];
    return [
      { label: 'Products', routerLink: base },
      { label, routerLink: [...base, id] },
      { label: 'Batches' }
    ];
  });

  private prevRouteProductId = '';

  constructor() {
    this.loadProduct();

    effect(() => {
      const id = this.routeProductId();
      if (!id) {
        return;
      }
      if (this.prevRouteProductId && this.prevRouteProductId !== id) {
        void this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { page: 1 },
          queryParamsHandling: 'merge'
        });
      }
      this.prevRouteProductId = id;
    });
  }

  backToProduct(): void {
    void this.router.navigate(['..'], { relativeTo: this.route });
  }

  onBatchesMutated(): void {
    const id = this.routeProductId();
    if (!id) {
      return;
    }
    this.loadProduct(id);
  }

  onPageChange(event: PaginatorState | TablePageEvent): void {
    const firstEvt = event.first ?? 0;
    const rows = event.rows ?? this.pageSize();
    const newPageIndex = Math.floor(firstEvt / Math.max(rows, 1));

    if (this.pageIndex() !== newPageIndex || this.pageSize() !== rows) {
      const isManualPageChange = this.pageIndex() !== newPageIndex;

      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          page: newPageIndex + 1,
          pageSize: rows
        },
        queryParamsHandling: 'merge'
      });

      if (isManualPageChange) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  retry(): void {
    this.loadProduct();
  }

  private loadProduct(idParam?: string): void {
    const id = idParam ?? this.routeProductId();
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
