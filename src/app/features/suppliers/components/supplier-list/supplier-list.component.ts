import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorModule } from 'primeng/paginator';

import {
  ListSkeletonComponent,
  type ListSkeletonColumn,
  DEFAULT_LIST_SKELETON_COLUMNS
} from '../../../../shared/ui/list-skeleton/list-skeleton.component';
import type { Supplier } from '../../models/supplier.entity';
import { DEFAULT_PAGE_SIZE_OPTIONS, type PaginatorPageEvent } from '../../../../shared/models/pagination';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    PaginatorModule,
    ListSkeletonComponent
  ],
  templateUrl: './supplier-list.component.html'
})
export class SupplierListComponent {
  suppliers = input.required<Supplier[]>();
  totalRecords = input.required<number>();
  first = input.required<number>();
  pageSize = input.required<number>();
  isListLoading = input.required<boolean>();
  pageSizeOptions = input<number[]>(DEFAULT_PAGE_SIZE_OPTIONS);

  readonly skeletonColumns: ListSkeletonColumn[] = [
    { width: '50%' },
    { width: '70%' },
    { width: '55%' },
    { width: '45%' },
    { width: '40%' },
    { width: '', actions: 2 }
  ];

  viewSupplier = output<Supplier>();
  pageChange = output<PaginatorPageEvent>();
  clearFilters = output<void>();
}
