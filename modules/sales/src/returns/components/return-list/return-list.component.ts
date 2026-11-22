import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';

import { EmptyStateComponent } from '@invoria/ui';
import {
  ListSkeletonComponent,
  type ListSkeletonColumn,
} from '@invoria/ui';
import { SurfaceCardComponent } from '@invoria/ui';

import type { Return } from '@invoria/sales/returns/models/return.entity';
import { returnTypeLabel } from '@invoria/sales/returns/models/return-type.enum';
import { returnStatusUserLabel, returnStatusSeverity } from '@invoria/sales/returns/models/return-status.enum';
import {
  DEFAULT_PAGE_SIZE_OPTIONS,
  type PaginatorPageEvent,
} from '@invoria/utils';

@Component({
  selector: 'app-return-list',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    TagModule,
    SkeletonModule,
    EmptyStateComponent,
    ListSkeletonComponent,
    SurfaceCardComponent,
  ],
  templateUrl: './return-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReturnListComponent {
  returns = input.required<Return[]>();
  totalRecords = input.required<number>();
  first = input.required<number>();
  pageSize = input.required<number>();
  isListLoading = input.required<boolean>();
  pageSizeOptions = input<number[]>(DEFAULT_PAGE_SIZE_OPTIONS);

  viewReturn = output<Return>();
  pageChange = output<PaginatorPageEvent>();
  clearFilters = output<void>();

  readonly skeletonColumns: ListSkeletonColumn[] = [
    { width: '60%' },
    { width: '40%' },
    { width: '30%' },
    { width: '20%' },
    { width: '40%' },
    { width: '', actions: 1, align: 'right' },
  ];

  readonly skeletonRows = computed(() =>
    Array.from({ length: this.pageSize() }, (_, index) => index),
  );

  protected readonly returnTypeLabel = returnTypeLabel;
  protected readonly returnStatusUserLabel = returnStatusUserLabel;
  protected readonly returnStatusSeverity = returnStatusSeverity;
}
