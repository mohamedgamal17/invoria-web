import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, map, take } from 'rxjs';
import type { PaginatorState } from 'primeng/paginator';
import type { TablePageEvent } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { presentApiError } from '../../../../core/http/api-error.presenter';
import { ProductDetailsInfoPanelComponent } from '../../components/product-details-info-panel/product-details-info-panel.component';
import { ProductDetailsToolbarComponent } from '../../components/product-details-toolbar/product-details-toolbar.component';
import { ProductDetailsOrdersPanelComponent } from '../../components/product-details-orders-panel/product-details-orders-panel.component';
import { ProductBatchesPanelComponent } from '../../../inventory/components/product-batches-panel.component';
import type { BatchesProductRef } from '../../../inventory/models/batches-product.ref';
import { ProductsBreadcrumbComponent } from '../../components/products-breadcrumb/products-breadcrumb.component';
import type { Product } from '../../models/product.entity';
import { ProductsApiService } from '../../services/products-api.service';

function tabSlugToIndex(tab: string | null): number | null {
  if (tab === 'batches') return 1;
  if (tab === 'orders') return 2;
  if (tab === 'info' || tab === null || tab === '') return 0;
  return null;
}

function indexToTabSlug(index: number): 'info' | 'batches' | 'orders' {
  if (index === 1) return 'batches';
  if (index === 2) return 'orders';
  return 'info';
}

@Component({
  selector: 'app-product-details-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    SkeletonModule,
    ToastModule,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    ProductsBreadcrumbComponent,
    ProductDetailsToolbarComponent,
    ProductDetailsInfoPanelComponent,
    ProductBatchesPanelComponent,
    ProductDetailsOrdersPanelComponent,
  ],
  providers: [MessageService],
  templateUrl: './product-details-page.component.html',
})
export class ProductDetailsPageComponent {
  private readonly productsApi = inject(ProductsApiService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly productId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' },
  );

  private readonly queryParamsSig = toSignal(
    this.route.queryParamMap.pipe(
      map((m) => ({
        tab: m.get('tab'),
        page: m.get('page'),
        pageSize: m.get('pageSize'),
      })),
    ),
    {
      initialValue: {
        tab: this.route.snapshot.queryParamMap.get('tab'),
        page: this.route.snapshot.queryParamMap.get('page'),
        pageSize: this.route.snapshot.queryParamMap.get('pageSize'),
      },
    },
  );

  readonly pageSizeOptions = [25, 50, 100, 200];

  readonly loading = signal(true);
  readonly deleting = signal(false);
  readonly error = signal('');
  readonly product = signal<Product | null>(null);
  readonly hasProduct = computed(() => !!this.product());
  readonly actionsDisabled = computed(
    () => this.loading() || this.deleting() || !!this.error() || !this.hasProduct(),
  );

  readonly activeTab = signal(0);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(25);
  readonly first = computed(() => this.pageIndex() * this.pageSize());

  readonly batchesProductRef = computed((): BatchesProductRef | null => {
    const p = this.product();
    if (!p) {
      return null;
    }
    return { id: p.id, name: p.name };
  });

  readonly breadcrumbItems = computed(() => {
    const p = this.product();
    const label = p ? p.name.trim() || 'Product' : 'Product';
    return [{ label: 'Products', routerLink: ['/products'] as string[] }, { label }];
  });

  constructor() {
    effect(() => {
      this.loadProduct(this.productId());
    });

    effect(() => {
      const qp = this.queryParamsSig();
      const p = this.product();
      if (!p || this.loading()) {
        return;
      }
      untracked(() => this.applyBatchQueryParams(qp));
    });
  }

  backToList(): void {
    void this.router.navigate(['/products']);
  }

  goToEdit(): void {
    void this.router.navigate(['edit'], { relativeTo: this.route });
  }

  onTabChange(value: string | number | undefined): void {
    if (value === undefined || value === null) {
      return;
    }
    const n = typeof value === 'number' ? value : Number(value);
    const next = Number.isFinite(n) ? n : 0;
    this.activeTab.set(next);
    const tabSlug = indexToTabSlug(next);

    void this.router.navigate([], {
      relativeTo: this.route,
      replaceUrl: true,
      queryParams:
        tabSlug === 'batches'
          ? {
              tab: 'batches',
              page: this.pageIndex() + 1,
              pageSize: this.pageSize(),
            }
          : tabSlug === 'orders'
            ? { tab: 'orders' }
            : {
                tab: 'info',
              },
    });
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
            finalize(() => this.deleting.set(false)),
          )
          .subscribe({
            next: (res) => {
              if (!res.isSuccess) {
                const presentation = presentApiError(res.error);
                this.messageService.add({
                  ...presentation.toast,
                  detail: `Could not delete product. ${presentation.toast.detail}`,
                });
                return;
              }
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Product deleted successfully.',
              });
              void this.router.navigate(['/products']);
            },
            error: (err: unknown) => {
              const presentation = presentApiError(err);
              this.messageService.add({
                ...presentation.toast,
                detail: `Could not delete product. ${presentation.toast.detail}`,
              });
            },
          });
      },
    });
  }

  retry(): void {
    this.loadProduct();
  }

  onPageChange(event: PaginatorState | TablePageEvent): void {
    const firstEvt = event.first ?? 0;
    const rows = event.rows ?? this.pageSize();
    const newPageIndex = Math.floor(firstEvt / Math.max(rows, 1));

    if (this.pageIndex() !== newPageIndex || this.pageSize() !== rows) {
      const isManualPageChange = this.pageIndex() !== newPageIndex;
      this.pageSize.set(rows);
      this.pageIndex.set(newPageIndex);
      void this.router.navigate([], {
        relativeTo: this.route,
        replaceUrl: true,
        queryParams: {
          tab: indexToTabSlug(this.activeTab()),
          page: newPageIndex + 1,
          pageSize: rows,
        },
        queryParamsHandling: 'merge',
      });
      if (isManualPageChange) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  onBatchesMutated(): void {
    this.loadProduct(this.productId());
  }

  private applyBatchQueryParams(qp: {
    tab: string | null;
    page: string | null;
    pageSize: string | null;
  }): void {
    const idx = tabSlugToIndex(qp.tab?.toLowerCase() ?? qp.tab);
    if (idx !== null && this.activeTab() !== idx) {
      this.activeTab.set(idx);
    }

    const isBatchesTab = (idx ?? this.activeTab()) === 1;

    // Only honor page/pageSize when batches tab is active to avoid polluting other tabs' URLs
    if (isBatchesTab) {
      if (qp.page !== null) {
        const pn = parseInt(qp.page, 10);
        if (Number.isFinite(pn) && pn >= 1) {
          this.pageIndex.set(pn - 1);
        }
      }
      if (qp.pageSize !== null) {
        const psz = parseInt(qp.pageSize, 10);
        if (Number.isFinite(psz) && this.pageSizeOptions.includes(psz)) {
          this.pageSize.set(psz);
        }
      }
    }
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
        finalize(() => this.loading.set(false)),
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
        },
      });
  }
}
