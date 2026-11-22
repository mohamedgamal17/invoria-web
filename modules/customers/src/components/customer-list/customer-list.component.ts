import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorModule } from 'primeng/paginator';

import {
  ListSkeletonComponent,
  type ListSkeletonColumn,
  DEFAULT_LIST_SKELETON_COLUMNS
} from '@invoria/ui';
import type { Customer } from '@invoria/customers/models/customer.entity';
import { EmptyStateComponent } from '@invoria/ui';
import { SurfaceCardComponent } from '@invoria/ui';
import { DEFAULT_PAGE_SIZE_OPTIONS, type PaginatorPageEvent } from '@invoria/utils';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    PaginatorModule,
    ListSkeletonComponent,
    EmptyStateComponent,
    SurfaceCardComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './customer-list.component.html'
})
export class CustomerListComponent {
  customers = input.required<Customer[]>();
  totalRecords = input.required<number>();
  first = input.required<number>();
  pageSize = input.required<number>();
  isListLoading = input.required<boolean>();
  pageSizeOptions = input<number[]>(DEFAULT_PAGE_SIZE_OPTIONS);

  readonly skeletonColumns: ListSkeletonColumn[] = [{ width: '60%' }, { width: '40%' }, { width: '', actions: 2 }];

  viewCustomer = output<Customer>();
  pageChange = output<PaginatorPageEvent>();
  clearFilters = output<void>();
}
