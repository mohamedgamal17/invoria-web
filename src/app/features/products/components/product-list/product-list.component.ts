import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import type { PaginatorState } from 'primeng/paginator';
import type { TablePageEvent } from 'primeng/table';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { SurfaceCardComponent } from '../../../../shared/ui/surface-card/surface-card.component';

import type { Product } from '../../models/product.entity';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    SkeletonModule,
    TooltipModule,
    EmptyStateComponent,
    SurfaceCardComponent
  ],
  templateUrl: './product-list.component.html'
})
export class ProductListComponent {
  products = input.required<Product[]>();
  totalRecords = input.required<number>();
  first = input.required<number>();
  pageSize = input.required<number>();
  isListLoading = input.required<boolean>();
  pageSizeOptions = input<number[]>([25, 50, 100, 200]);

  viewProduct = output<Product>();
  pageChange = output<PaginatorState | TablePageEvent>();
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

  get skeletonRows(): number[] {
    return Array.from({ length: this.pageSize() }, (_, i) => i);
  }
}
