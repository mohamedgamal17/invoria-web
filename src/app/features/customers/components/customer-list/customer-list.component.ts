import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import type { PaginatorState } from 'primeng/paginator';
import { PaginatorModule } from 'primeng/paginator';
import type { TablePageEvent } from 'primeng/table';

import { CustomerListSkeletonComponent } from '../customer-list-skeleton/customer-list-skeleton.component';
import type { Customer } from '../../models/customer.entity';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { SurfaceCardComponent } from '../../../../shared/ui/surface-card/surface-card.component';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    PaginatorModule,
    CustomerListSkeletonComponent,
    EmptyStateComponent,
    SurfaceCardComponent
  ],
  templateUrl: './customer-list.component.html'
})
export class CustomerListComponent {
  customers = input.required<Customer[]>();
  totalRecords = input.required<number>();
  first = input.required<number>();
  pageSize = input.required<number>();
  isListLoading = input.required<boolean>();
  pageSizeOptions = input<number[]>([25, 50, 100, 200]);

  viewCustomer = output<Customer>();
  pageChange = output<PaginatorState | TablePageEvent>();
  clearFilters = output<void>();
}
