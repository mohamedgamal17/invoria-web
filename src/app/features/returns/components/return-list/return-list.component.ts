import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';

import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { SurfaceCardComponent } from '../../../../shared/ui/surface-card/surface-card.component';

import type { Return } from '../../models/return.entity';
import { returnTypeLabel } from '../../models/return-type.enum';
import { returnStatusUserLabel, returnStatusSeverity } from '../../models/return-status.enum';
import { DEFAULT_PAGE_SIZE_OPTIONS, type PaginatorPageEvent } from '../../../../shared/models/pagination';

@Component({
  selector: 'app-return-list',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    SkeletonModule,
    TagModule,
    EmptyStateComponent,
    SurfaceCardComponent
  ],
  templateUrl: './return-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
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

  readonly skeletonRows = computed(() =>
    Array.from({ length: this.pageSize() }, (_, index) => index)
  );

  protected readonly returnTypeLabel = returnTypeLabel;
  protected readonly returnStatusUserLabel = returnStatusUserLabel;
  protected readonly returnStatusSeverity = returnStatusSeverity;
}


