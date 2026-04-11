import { CommonModule } from '@angular/common';
import { Component, type OnInit, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, catchError, EMPTY } from 'rxjs';

import { Router, ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import type { PaginatorState } from 'primeng/paginator';
import type { TablePageEvent } from 'primeng/table';

import { ProductHeaderComponent } from '../../components/product-header/product-header.component';
import { ProductListComponent } from '../../components/product-list/product-list.component';
import { ProductDialogComponent, type ProductDraft, type ModalMode } from '../../components/product-dialog/product-dialog.component';
import { ProductBatchesModalComponent } from '../../../inventory/components/product-batches-modal.component';

import { ProductsApiService } from '../../services/products-api.service';
import type { Product } from '../../models/product.entity';
import type { CreateProductRequest } from '../../models/create-product.request';
import type { ListProductRequest } from '../../models/list-product.request';
import type { UpdateProductRequest } from '../../models/update-product.request';

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
export class ProductsPageComponent implements OnInit {
  readonly pageSizeOptions = [5, 10, 20];

  products = signal<Product[]>([]);
  totalRecords = signal(0);

  first = signal(0);
  pageSize = signal(10);

  // Start in loading state so the first render shows skeleton immediately.
  isListLoading = signal(true);

  modalVisible = signal(false);
  modalMode = signal<ModalMode>('create');
  modalSaving = signal(false);
  selectedProduct = signal<Product | null>(null);

  batchesVisible = signal(false);
  selectedProductForInventory = signal<Product | null>(null);

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly productsApi: ProductsApiService,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(
        switchMap(params => {
          const page = params['page'] ? parseInt(params['page'], 10) : 1;
          const size = params['pageSize'] ? parseInt(params['pageSize'], 10) : 10;
          const newPageIndex = Math.max(0, page - 1);
          const newFirst = newPageIndex * size;

          this.first.set(newFirst);
          this.pageSize.set(size);
          this.isListLoading.set(true);
          this.products.set([]);

          const listRequest: ListProductRequest = {
            Skip: newPageIndex * size,
            Length: size
          };

          return this.productsApi.listProducts(listRequest).pipe(
            catchError(err => {
              const message = err instanceof Error ? err.message : 'Unexpected error.';
              this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
              this.products.set([]);
              this.totalRecords.set(0);
              this.isListLoading.set(false);
              return EMPTY;
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(body => {
        this.isListLoading.set(false);
        if (!body.isSuccess || !body.result) {
          const detail = this.formatApiFailureDetail(body.error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail });
          this.products.set([]);
          this.totalRecords.set(0);
          return;
        }
        this.products.set(body.result.data);
        this.totalRecords.set(body.result.info.totalCount);
      });
  }

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
      .pipe(takeUntilDestroyed(this.destroyRef))
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
            const pageIndex = Math.floor(this.first() / this.pageSize());
            if (pageIndex === 0) {
              this.products.update(current => {
                const next = [result, ...current];
                if (next.length > this.pageSize()) next.pop();
                return next;
              });
            }
            this.totalRecords.update(t => t + 1);
          } else {
            this.products.update(current =>
              current.map(p => p.id === result.id ? result : p)
            );
          }
        },
        error: (err) => {
          const message = err instanceof Error ? err.message : 'Unexpected error.';
          this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
        },
        complete: () => {
          this.modalSaving.set(false);
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
        this.productsApi.deleteProduct(product.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (res) => {
              if (!res.isSuccess) {
                const detail = this.formatApiFailureDetail(res.error);
                this.messageService.add({ severity: 'error', summary: 'Error', detail });
                return;
              }
              this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Product deleted successfully.' });
              this.products.update(current => current.filter(p => p.id !== product.id));
              this.totalRecords.update(t => t - 1);

              if (this.products().length === 0 && this.first() > 0) {
                const pageIndex = Math.floor(this.first() / this.pageSize());
                void this.router.navigate([], {
                  relativeTo: this.route,
                  queryParams: { page: pageIndex },
                  queryParamsHandling: 'merge',
                });
              }
            },
            error: (err) => {
              const message = err instanceof Error ? err.message : 'Unexpected error.';
              this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
            }
          });
      }
    });
  }

  onPageChange(event: PaginatorState | TablePageEvent): void {
    const first = event.first ?? 0;
    const rows = event.rows ?? this.pageSize();
    const newPageIndex = Math.floor(first / Math.max(rows, 1));

    if (this.first() !== first || this.pageSize() !== rows) {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          page: newPageIndex + 1,
          pageSize: rows
        },
        queryParamsHandling: 'merge',
      });

      if (this.first() !== first) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  viewBatches(product: Product): void {
    this.selectedProductForInventory.set(product);
    this.batchesVisible.set(true);
  }

  onBatchesMutated(): void {
    const listRequest: ListProductRequest = {
      Skip: this.first(),
      Length: this.pageSize()
    };
    this.productsApi
      .listProducts(listRequest)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (body) => {
          if (!body.isSuccess || !body.result) {
            return;
          }
          this.products.set(body.result.data);
          this.totalRecords.set(body.result.info.totalCount);

          const inv = this.selectedProductForInventory();
          if (inv) {
            const updated = body.result.data.find((p) => p.id === inv.id);
            if (updated) {
              this.selectedProductForInventory.set(updated);
            }
          }
        },
        error: (err) => {
          const message = err instanceof Error ? err.message : 'Unexpected error.';
          this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
        }
      });
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
