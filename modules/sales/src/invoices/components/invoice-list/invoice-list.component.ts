import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
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
import type { Invoice } from '@invoria/sales/invoices/models/invoice.entity';
import { EmptyStateComponent } from '@invoria/ui';
import { SurfaceCardComponent } from '@invoria/ui';
import { DEFAULT_PAGE_SIZE_OPTIONS, type PaginatorPageEvent } from '@invoria/utils';
import { DEFAULT_CURRENCY_CODE } from '@invoria/utils';

@Component({
  selector: 'app-invoice-list',
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
  templateUrl: './invoice-list.component.html'
})
export class InvoiceListComponent {
  protected readonly currencyCode = signal(DEFAULT_CURRENCY_CODE);
  invoices = input.required<Invoice[]>();
  totalRecords = input.required<number>();
  first = input.required<number>();
  pageSize = input.required<number>();
  isListLoading = input.required<boolean>();
  pageSizeOptions = input<number[]>(DEFAULT_PAGE_SIZE_OPTIONS);

  readonly skeletonColumns: ListSkeletonColumn[] = [
    { width: '60%' },
    { width: '40%' },
    { width: '40%' },
    { width: '30%' },
    { width: '40%' },
    { width: '', actions: 1 }
  ];


  viewInvoice = output<Invoice>();
  pageChange = output<PaginatorPageEvent>();
  clearFilters = output<void>();
}
