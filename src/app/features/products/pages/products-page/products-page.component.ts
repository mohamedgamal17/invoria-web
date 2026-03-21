import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, type OnInit, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { PaginatorModule } from 'primeng/paginator';
import { MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';

import { ProductsMockApiService } from '../../services/products-mock-api.service';
import type { Product, ProductCreateInput } from '../../models/product';

type ProductDraft = {
  name: string;
  code: string;
  price: number;
};

type ModalMode = 'create' | 'edit';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    TableModule,
    ProgressSpinnerModule,
    SkeletonModule,
    TagModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    ToastModule,
    PaginatorModule
  ],
  providers: [MessageService],
  templateUrl: './products-page.component.html'
})
export class ProductsPageComponent implements OnInit {
  readonly pageSizeOptions = [5, 10, 20];

  products: Product[] = [];
  totalRecords = 0;

  pageIndex = 0;
  pageSize = 10;

  // Start in loading state so the first render shows skeleton immediately.
  isListLoading = true;

  modalVisible = false;
  modalMode: ModalMode = 'create';
  modalSaving = false;
  private editingId: string | null = null;

  draft: ProductDraft = {
    name: '',
    code: '',
    price: 0
  };

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly productsApi: ProductsMockApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly messageService: MessageService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const page = params['page'] ? parseInt(params['page'], 10) : 1;
        const newPageIndex = Math.max(0, page - 1);
        
        if (this.pageIndex !== newPageIndex || this.isListLoading) {
          this.pageIndex = newPageIndex;
          void this.loadProducts();
        }
      });
  }

  get skeletonRows(): number[] {
    return Array.from({ length: this.pageSize }, (_, i) => i);
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.editingId = null;
    this.draft = { name: '', code: '', price: 0 };
    this.modalVisible = true;
  }

  openEditModal(product: Product): void {
    this.modalMode = 'edit';
    this.editingId = product.id;
    this.draft = {
      name: product.name,
      code: product.code,
      price: product.price
    };
    this.modalVisible = true;
  }

  onModalHide(): void {
    this.modalSaving = false;
  }

  async submitModal(): Promise<void> {
    this.modalSaving = true;

    const input: ProductCreateInput = {
      name: this.draft.name,
      code: this.draft.code,
      price: this.draft.price
    };

    try {
      if (this.modalMode === 'create') {
        await firstValueFrom(this.productsApi.createProduct(input));
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Product created successfully.' });
        this.modalVisible = false;
      } else {
        if (!this.editingId) throw new Error('Missing product id.');
        await firstValueFrom(this.productsApi.updateProduct(this.editingId, input));
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Product updated successfully.' });
        this.modalVisible = false;
      }

      // Refresh list after create/update.
      await this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { page: 1 },
        queryParamsHandling: 'merge',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected error.';
      this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
    } finally {
      this.modalSaving = false;
    }
  }

  closeModal(): void {
    this.modalVisible = false;
  }

  async deleteProduct(product: Product): Promise<void> {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return;

    try {
      await firstValueFrom(this.productsApi.deleteProduct(product.id));
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Product deleted successfully.' });
      await this.loadProducts();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected error.';
      this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
    }
  }

  async onPageChange(event: any): Promise<void> {
    const first = event.first ?? 0;
    const rows = event.rows ?? this.pageSize;
    const newPageIndex = Math.floor(first / Math.max(rows, 1));
    
    if (this.pageIndex !== newPageIndex || this.pageSize !== rows) {
      const isPageSizeChangeOnly = this.pageIndex === newPageIndex && this.pageSize !== rows;
      this.pageSize = rows;
      
      const isManualPageChange = this.pageIndex !== newPageIndex;
      
      await this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { page: newPageIndex + 1 },
        queryParamsHandling: 'merge',
      });

      if (isManualPageChange) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (isPageSizeChangeOnly) {
        // If only page size changed, navigation above might not trigger queryParams sub
        // because the 'page' value didn't change in the URL.
        await this.loadProducts();
      }
    }
  }

  private async loadProducts(): Promise<void> {
    this.isListLoading = true;
    // Clear current list so the table shows the loading skeleton immediately.
    this.products = [];

    try {
      const result = await firstValueFrom(this.productsApi.listProducts(this.pageIndex, this.pageSize));
      this.products = result.items;
      this.totalRecords = result.total;
    } catch (err: unknown) {
      this.products = [];
      this.totalRecords = 0;
      const message = err instanceof Error ? err.message : 'Unexpected error.';
      this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
    } finally {
      this.isListLoading = false;
      // Some navigation paths appear to be change-detection constrained on first visit.
      // Forcing a refresh ensures skeleton -> table transition happens without user clicks.
      this.cdr.detectChanges();
    }
  }


}

