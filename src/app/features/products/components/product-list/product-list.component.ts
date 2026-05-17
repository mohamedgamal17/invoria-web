import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
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

  formatQuantitySummary(actualQuantity: number, reservedQuantity: number): string {
    return `Actual ${actualQuantity} / Reserved ${reservedQuantity}`;
  }

  get skeletonRows(): number[] {
    return Array.from({ length: this.pageSize() }, (_, i) => i);
  }
}
