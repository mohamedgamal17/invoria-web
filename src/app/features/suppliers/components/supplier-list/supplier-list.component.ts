import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import type { PaginatorState } from 'primeng/paginator';
import { PaginatorModule } from 'primeng/paginator';
import type { TablePageEvent } from 'primeng/table';

import { SupplierListSkeletonComponent } from '../supplier-list-skeleton/supplier-list-skeleton.component';
import type { Supplier } from '../../models/supplier.entity';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    PaginatorModule,
    SupplierListSkeletonComponent
  ],
  templateUrl: './supplier-list.component.html'
})
export class SupplierListComponent {
  suppliers = input.required<Supplier[]>();
  totalRecords = input.required<number>();
  first = input.required<number>();
  pageSize = input.required<number>();
  isListLoading = input.required<boolean>();
  pageSizeOptions = input<number[]>([25, 50, 100, 200]);

  viewSupplier = output<Supplier>();
  pageChange = output<PaginatorState | TablePageEvent>();
  clearFilters = output<void>();
}
