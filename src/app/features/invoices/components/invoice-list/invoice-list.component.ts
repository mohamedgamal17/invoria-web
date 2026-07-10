import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import type { PaginatorState } from 'primeng/paginator';
import { PaginatorModule } from 'primeng/paginator';
import type { TablePageEvent } from 'primeng/table';

import { InvoiceListSkeletonComponent } from '../invoice-list-skeleton/invoice-list-skeleton.component';
import type { Invoice } from '../../models/invoice.entity';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { SurfaceCardComponent } from '../../../../shared/ui/surface-card/surface-card.component';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    PaginatorModule,
    InvoiceListSkeletonComponent,
    EmptyStateComponent,
    SurfaceCardComponent
  ],
  templateUrl: './invoice-list.component.html'
})
export class InvoiceListComponent {
  invoices = input.required<Invoice[]>();
  totalRecords = input.required<number>();
  first = input.required<number>();
  pageSize = input.required<number>();
  isListLoading = input.required<boolean>();
  pageSizeOptions = input<number[]>([25, 50, 100, 200]);

  viewInvoice = output<Invoice>();
  pageChange = output<PaginatorState | TablePageEvent>();
  clearFilters = output<void>();
}
