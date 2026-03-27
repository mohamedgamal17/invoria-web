import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, type OnInit, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { switchMap, tap, catchError, EMPTY } from 'rxjs';

import { Router, ActivatedRoute } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';

import { ProductHeaderComponent } from '../../components/product-header/product-header.component';
import { ProductListComponent } from '../../components/product-list/product-list.component';
import { ProductDialogComponent, type ProductDraft, type ModalMode } from '../../components/product-dialog/product-dialog.component';
import { ProductBatchesModalComponent } from '../../inventory/components/product-batches-modal.component';

import { ProductsMockApiService } from '../../services/products-mock-api.service';
import type { Product, ProductCreateInput } from '../../models/product';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    ProductHeaderComponent,
    ProductListComponent,
    ProductDialogComponent,
    ProductBatchesModalComponent,
    DialogModule
  ],
  providers: [MessageService, DialogService],
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

  modalVisible = false;
  modalMode: ModalMode = 'create';
  modalSaving = false;
  selectedProduct: Product | null = null;

  batchesVisible = signal(false);
  selectedProductForInventory = signal<Product | null>(null);

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly productsApi: ProductsMockApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly messageService: MessageService,
    private readonly dialogService: DialogService,
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

          return this.productsApi.listProducts(newPageIndex, size).pipe(
            catchError(err => {
              const message = err instanceof Error ? err.message : 'Unexpected error.';
              this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
              this.products.set([]);
              this.totalRecords.set(0);
              return EMPTY;
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(result => {
        this.products.set(result.items);
        this.totalRecords.set(result.total);
        this.isListLoading.set(false);
        this.cdr.detectChanges();
      });
  }

  get skeletonRows(): number[] {
    return Array.from({ length: this.pageSize() }, (_, i) => i);
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.selectedProduct = null;
    this.modalVisible = true;
  }

  openEditModal(product: Product): void {
    this.modalMode = 'edit';
    this.selectedProduct = product;
    this.modalVisible = true;
  }

  onModalHide(): void {
    this.modalSaving = false;
    this.selectedProduct = null;
  }

  submitModal(draft: ProductDraft): void {
    this.modalSaving = true;

    const input: ProductCreateInput = {
      name: draft.name,
      code: draft.code,
      price: draft.price
    };

    const request$ = this.modalMode === 'create'
      ? this.productsApi.createProduct(input)
      : this.productsApi.updateProduct(this.selectedProduct!.id, input);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Product ${this.modalMode === 'create' ? 'created' : 'updated'} successfully.`
          });
          this.modalVisible = false;

          if (this.modalMode === 'create') {
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
          this.modalSaving = false;
        }
      });
  }

  closeModal(): void {
    this.modalVisible = false;
  }

  deleteProduct(product: Product): void {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return;

    this.productsApi.deleteProduct(product.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Product deleted successfully.' });
          this.products.update(current => current.filter(p => p.id !== product.id));
          this.totalRecords.update(t => t - 1);

          if (this.products().length === 0 && this.first() > 0) {
            // Trigger a reload by navigating or calling a internal reload
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

  onPageChange(event: any): void {
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


}

