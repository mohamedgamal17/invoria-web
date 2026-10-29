import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import type { PaginatorState } from 'primeng/paginator';
import { PaginatorModule } from 'primeng/paginator';
import type { TablePageEvent } from 'primeng/table';

import { PayableListSkeletonComponent } from '../payable-list-skeleton/payable-list-skeleton.component';
import type { Payable } from '../../models/payable.entity';
import {
  FinancialObligationStatus,
  financialObligationStatusLabel,
  financialObligationStatusSeverity
} from '../../models/payable-status.enum';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { SurfaceCardComponent } from '../../../../shared/ui/surface-card/surface-card.component';

@Component({
  selector: 'app-payable-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    PaginatorModule,
    PayableListSkeletonComponent,
    EmptyStateComponent,
    SurfaceCardComponent
  ],
  templateUrl: './payable-list.component.html'
})
export class PayableListComponent {
  payables = input.required<Payable[]>();
  totalRecords = input.required<number>();
  first = input.required<number>();
  pageSize = input.required<number>();
  isListLoading = input.required<boolean>();
  pageSizeOptions = input<number[]>([25, 50, 100, 200]);

  viewPayable = output<Payable>();
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
