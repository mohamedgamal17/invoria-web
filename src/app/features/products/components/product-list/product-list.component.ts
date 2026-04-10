import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import type { PaginatorState } from 'primeng/paginator';
import type { TablePageEvent } from 'primeng/table';

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
    TagModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule
  ],
  templateUrl: './product-list.component.html'
})
export class ProductListComponent {
  products = input.required<Product[]>();
  totalRecords = input.required<number>();
  first = input.required<number>();
  pageSize = input.required<number>();
  isListLoading = input.required<boolean>();
  pageSizeOptions = input<number[]>([5, 10, 20]);

  edit = output<Product>();
  delete = output<Product>();
  viewBatches = output<Product>();
  pageChange = output<PaginatorState | TablePageEvent>();

  get skeletonRows(): number[] {
    return Array.from({ length: this.pageSize() }, (_, i) => i);
  }
}
