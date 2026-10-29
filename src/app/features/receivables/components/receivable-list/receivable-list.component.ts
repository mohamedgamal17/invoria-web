import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import type { PaginatorState } from 'primeng/paginator';
import { PaginatorModule } from 'primeng/paginator';
import type { TablePageEvent } from 'primeng/table';

import { ReceivableListSkeletonComponent } from '../receivable-list-skeleton/receivable-list-skeleton.component';
import type { Receivable } from '../../models/receivable.entity';
import {
  FinancialObligationStatus,
  financialObligationStatusLabel,
  financialObligationStatusSeverity
} from '../../models/receivable-status.enum';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { SurfaceCardComponent } from '../../../../shared/ui/surface-card/surface-card.component';

@Component({
  selector: 'app-receivable-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    PaginatorModule,
    ReceivableListSkeletonComponent,
    EmptyStateComponent,
    SurfaceCardComponent
  ],
  templateUrl: './receivable-list.component.html'
})
export class ReceivableListComponent {
  receivables = input.required<Receivable[]>();
  totalRecords = input.required<number>();
  first = input.required<number>();
  pageSize = input.required<number>();
  isListLoading = input.required<boolean>();
  pageSizeOptions = input<number[]>([25, 50, 100, 200]);

  viewReceivable = output<Receivable>();
  pageChange = output<PaginatorState | TablePageEvent>();
  clearFilters = output<void>();

  statusLabel(status: FinancialObligationStatus): string {
    return financialObligationStatusLabel(status);
  }

  statusSeverity(
    status: FinancialObligationStatus
  ): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
    return financialObligationStatusSeverity(status);
  }
}
