import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, linkedSignal, model, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, map, of, take } from 'rxjs';

import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import type { PaginatorState } from 'primeng/paginator';
import type { TablePageEvent } from 'primeng/table';

import type { PagingInfo } from '../../../../core/models/paging';
import { ProductHeaderComponent } from '../../components/product-header/product-header.component';
import { ProductListComponent } from '../../components/product-list/product-list.component';
import {
  ProductDialogComponent,
  type ProductDraft,
  type ModalMode
} from '../../components/product-dialog/product-dialog.component';
import { ProductBatchesModalComponent } from '../../../inventory/components/product-batches-modal.component';

import { ProductsApiService } from '../../services/products-api.service';
import type { Product } from '../../models/product.entity';
import type { CreateProductRequest } from '../../models/create-product.request';
import type { ListProductRequest } from '../../models/list-product.request';
import type { UpdateProductRequest } from '../../models/update-product.request';

const EMPTY_PRODUCTS_TUPLE: [Product[], PagingInfo] = [
  [],
  { length: 0, skip: 0, totalCount: 0 }
];

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    ConfirmDialogModule,
    ProductHeaderComponent,
    ProductListComponent,
    ProductDialogComponent,
    ProductBatchesModalComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './products-page.component.html'
})
export class ProductsPageComponent {
  readonly pageSizeOptions = [5, 10, 20];

  private readonly productsApi = inject(ProductsApiService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

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

  /** Page size from `?pageSize=` (must be in pageSizeOptions; default 10). */
  readonly pageSize = toSignal(
    this.route.queryParamMap.pipe(
      map((m) => {
        const raw = m.get('pageSize');
        const n = raw ? parseInt(raw, 10) : NaN;
        return this.pageSizeOptions.includes(n) ? n : 10;
      })
    ),
    { initialValue: 10 }
  );

  /** 0-based page index derived from the URL. */
  readonly pageIndex = computed(() => Math.max(0, this.pageFromRoute() - 1));

  readonly listRequest = computed((): ListProductRequest => ({
    Skip: this.pageIndex() * this.pageSize(),
    Length: this.pageSize()
  }));

  readonly first = computed(() => this.pageIndex() * this.pageSize());

  readonly productsResource = rxResource<[Product[], PagingInfo], ListProductRequest>({
    params: () => this.listRequest(),
    defaultValue: EMPTY_PRODUCTS_TUPLE,
    stream: ({ params }) =>
      this.productsApi.listProducts(params).pipe(
        map((res) => {
          if (!res.isSuccess || !res.result) {
            const detail = this.formatApiFailureDetail(res.error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail });
            return EMPTY_PRODUCTS_TUPLE;
          }
          return [res.result.data, res.result.info] as [Product[], PagingInfo];
        }),
        catchError((err: unknown) => {
          const message = err instanceof Error ? err.message : 'Unexpected error.';
          this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
          return of(EMPTY_PRODUCTS_TUPLE);
        })
      )
  });

  readonly displayProducts = linkedSignal({
    source: () => this.productsLinkSource(),
    computation: (src) => [...src.products]
  });

  readonly displayPaging = linkedSignal({
    source: () => this.productsLinkSource(),
    computation: (src) => ({ ...src.paging })
  });

  /** Two-way with `app-product-dialog` via `[(visible)]`. */
  modalVisible = model(false);
  modalMode = signal<ModalMode>('create');
  modalSaving = signal(false);
  selectedProduct = signal<Product | null>(null);

  batchesVisible = model(false);
  selectedProductForInventory = signal<Product | null>(null);

  private readonly syncInventoryProductRow = effect(() => {
    const rows = this.displayProducts();
    const inv = this.selectedProductForInventory();
    if (!this.batchesVisible() || !inv) {
      return;
    }
    const updated = rows.find((p) => p.id === inv.id);
    if (updated && updated !== inv) {
      this.selectedProductForInventory.set(updated);
    }
  });

  openCreateModal(): void {
    this.modalMode.set('create');
    this.selectedProduct.set(null);
    this.modalVisible.set(true);
  }

  openEditModal(product: Product): void {
    this.modalMode.set('edit');
    this.selectedProduct.set(product);
    this.modalVisible.set(true);
  }

  onModalHide(): void {
    this.modalSaving.set(false);
    this.selectedProduct.set(null);
  }

  submitModal(draft: ProductDraft): void {
    if (this.modalSaving()) {
      return;
    }
    this.modalSaving.set(true);

    const body: CreateProductRequest = {
      Name: draft.name.trim(),
      Code: draft.code.trim(),
      Price: draft.price
    };

    const currentMode = this.modalMode();
    const currentProduct = this.selectedProduct();
    const request$ =
      currentMode === 'create'
        ? this.productsApi.createProduct(body)
        : this.productsApi.updateProduct(currentProduct!.id, body satisfies UpdateProductRequest);

    request$
      .pipe(
        take(1),
        finalize(() => {
          this.modalSaving.set(false);
        })
      )
      .subscribe({
        next: (res) => {
          if (!res.isSuccess || res.result === undefined) {
            const detail = this.formatApiFailureDetail(res.error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail });
            return;
          }
          const result = res.result;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Product ${currentMode === 'create' ? 'created' : 'updated'} successfully.`
          });
          this.modalVisible.set(false);

          if (currentMode === 'create') {
            if (this.pageIndex() === 0) {
              const pageLen = this.pageSize();
              this.displayProducts.update((prev) =>
                prev.length >= pageLen
                  ? [result, ...prev.slice(0, pageLen - 1)]
                  : [result, ...prev]
              );
              this.displayPaging.update((p) => ({ ...p, totalCount: p.totalCount + 1 }));
            }
            void this.router.navigate([], {
              relativeTo: this.route,
              queryParams: { page: 1 },
              queryParamsHandling: 'merge'
            });
          } else {
            this.displayProducts.update((rows) => rows.map((p) => (p.id === result.id ? result : p)));
          }
        },
        error: (err: unknown) => {
          const message = err instanceof Error ? err.message : 'Unexpected error.';
          this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
        }
      });
  }

  closeModal(): void {
    this.modalVisible.set(false);
  }

  deleteProduct(product: Product): void {
    this.confirmationService.confirm({
      header: 'Delete Product',
      message: `Are you sure you want to delete "${product.name}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.productsApi
          .deleteProduct(product.id)
          .pipe(take(1))
          .subscribe({
            next: (res) => {
              if (!res.isSuccess) {
                const detail = this.formatApiFailureDetail(res.error);
                this.messageService.add({ severity: 'error', summary: 'Error', detail });
                return;
              }
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Product deleted successfully.'
              });
              this.displayProducts.update((current) => current.filter((p) => p.id !== product.id));
              this.displayPaging.update((p) => ({ ...p, totalCount: p.totalCount - 1 }));

              if (this.displayProducts().length === 0 && this.first() > 0) {
                const urlPage = this.pageIndex();
                void this.router.navigate([], {
                  relativeTo: this.route,
                  queryParams: { page: urlPage },
                  queryParamsHandling: 'merge'
                });
              }
            },
            error: (err: unknown) => {
              const message = err instanceof Error ? err.message : 'Unexpected error.';
              this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
            }
          });
      }
    });
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

  viewBatches(product: Product): void {
    this.selectedProductForInventory.set(product);
    this.batchesVisible.set(true);
  }

  onBatchesMutated(): void {
    this.productsResource.reload();
  }

  private productsLinkSource(): {
    request: ListProductRequest;
    products: Product[];
    paging: PagingInfo;
  } {
    const [products, paging] = this.productsResource.value();
    return {
      request: this.listRequest(),
      products,
      paging
    };
  }

  private formatApiFailureDetail(error: unknown): string {
    if (error === undefined || error === null) {
      return 'The server reported an unsuccessful response.';
    }
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    try {
      return JSON.stringify(error);
    } catch {
      return 'The server reported an unsuccessful response.';
    }
  }
}
