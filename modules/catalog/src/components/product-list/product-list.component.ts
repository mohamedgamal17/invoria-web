import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';
import { EmptyStateComponent } from '@invoria/ui';
import { SurfaceCardComponent } from '@invoria/ui';
import { DEFAULT_PAGE_SIZE_OPTIONS, type PaginatorPageEvent } from '@invoria/utils';
import {
  ListSkeletonComponent,
  type ListSkeletonColumn
} from '@invoria/ui';
import type { Product } from '@invoria/catalog/models/product.entity';
import { DEFAULT_CURRENCY_CODE } from '@invoria/utils';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    TooltipModule,
    EmptyStateComponent,
    SurfaceCardComponent,
    ListSkeletonComponent
  ],
  templateUrl: './product-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' }
})
export class ProductListComponent {
  protected readonly currencyCode = signal(DEFAULT_CURRENCY_CODE);
  products = input.required<Product[]>();
  totalRecords = input.required<number>();
  first = input.required<number>();
  pageSize = input.required<number>();
  isListLoading = input.required<boolean>();
  pageSizeOptions = input<number[]>(DEFAULT_PAGE_SIZE_OPTIONS);

  readonly skeletonColumns: ListSkeletonColumn[] = [
    { width: '60%', lines: 2 },
    { width: '4rem', align: 'right' },
    { width: '3.5rem', align: 'right' },
    { width: '3.5rem', align: 'right' },
    { width: '5.5rem', align: 'center' },
    { width: '', actions: 1, align: 'right' }
  ];

  viewProduct = output<Product>();
  pageChange = output<PaginatorPageEvent>();
  clearFilters = output<void>();

  getStockSeverity(product: Product): 'success' | 'warn' | 'danger' {
    if (product.stock.actualQuantity === 0) return 'danger';
    if (product.stock.actualQuantity - product.stock.reservedQuantity <= 0) return 'warn';
    return 'success';
  }

  stockStatusLabel(product: Product): string {
    if (product.stock.actualQuantity === 0) return 'Out of stock';
    const available = product.stock.actualQuantity - product.stock.reservedQuantity;
    if (available <= 0) return 'Fully reserved';
    return 'In stock';
  }

  formatQuantitySummary(actualQuantity: number, reservedQuantity: number): string {
    const available = actualQuantity - reservedQuantity;
    return `Actual ${actualQuantity}, Reserved ${reservedQuantity}, Available ${available}`;
  }

  availableQuantity(product: Product): number {
    return product.stock.actualQuantity - product.stock.reservedQuantity;
  }
}
