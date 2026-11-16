import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorModule } from 'primeng/paginator';

import {
  ListSkeletonComponent,
  type ListSkeletonColumn,
  DEFAULT_LIST_SKELETON_COLUMNS
} from '../../../../shared/ui/list-skeleton/list-skeleton.component';
import type { Payable } from '../../models/payable.entity';
import {
  FinancialObligationStatus,
  financialObligationStatusLabel,
  financialObligationStatusSeverity
} from '../../../../shared/models/financial-obligation-status';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { SurfaceCardComponent } from '../../../../shared/ui/surface-card/surface-card.component';
import { DEFAULT_PAGE_SIZE_OPTIONS, type PaginatorPageEvent } from '../../../../shared/models/pagination';
import { DEFAULT_CURRENCY_CODE } from '../../../../shared/models/currency';

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
    ListSkeletonComponent,
    EmptyStateComponent,
    SurfaceCardComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payable-list.component.html'
})
export class PayableListComponent {
  protected readonly currencyCode = signal(DEFAULT_CURRENCY_CODE);
  payables = input.required<Payable[]>();
  totalRecords = input.required<number>();
  first = input.required<number>();
  pageSize = input.required<number>();
  isListLoading = input.required<boolean>();
  pageSizeOptions = input<number[]>(DEFAULT_PAGE_SIZE_OPTIONS);

  readonly skeletonColumns = DEFAULT_LIST_SKELETON_COLUMNS;


  viewPayable = output<Payable>();
  pageChange = output<PaginatorPageEvent>();
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
