import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import type { PaginatorState } from 'primeng/paginator';
import type { TablePageEvent } from 'primeng/table';

import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { SurfaceCardComponent } from '../../../../shared/ui/surface-card/surface-card.component';

import type { Return } from '../../models/return.entity';
import { returnTypeLabel } from '../../models/return-type.enum';
import { returnStatusUserLabel, returnStatusSeverity } from '../../models/return-status.enum';

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
  templateUrl: './return-list.component.html'
})
export class ReturnListComponent {
  returns = input.required<Return[]>();
  totalRecords = input.required<number>();
  first = input.required<number>();
  pageSize = input.required<number>();
  isListLoading = input.required<boolean>();
  pageSizeOptions = input<number[]>([25, 50, 100, 200]);

  viewReturn = output<Return>();
  pageChange = output<PaginatorState | TablePageEvent>();
  clearFilters = output<void>();

  get skeletonRows(): number[] {
    return Array.from({ length: this.pageSize() }, (_, i) => i);
  }

  protected readonly returnTypeLabel = returnTypeLabel;
  protected readonly returnStatusUserLabel = returnStatusUserLabel;
  protected readonly returnStatusSeverity = returnStatusSeverity;
}


