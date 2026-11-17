import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorModule } from 'primeng/paginator';

import { DEFAULT_CURRENCY_CODE } from '../../models/currency';
import { DEFAULT_PAGE_SIZE_OPTIONS, type PaginatorPageEvent } from '../../models/pagination';
import {
  type FinancialObligationStatus,
  financialObligationStatusLabel,
  financialObligationStatusSeverity,
} from '../../models/financial-obligation-status';
import type { FinancialObligation } from '../../models/financial-obligation';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import {
  DEFAULT_LIST_SKELETON_COLUMNS,
  ListSkeletonComponent,
} from '../list-skeleton/list-skeleton.component';
import { SurfaceCardComponent } from '../surface-card/surface-card.component';

@Component({
  selector: 'app-financial-obligation-list',
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
    SurfaceCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './financial-obligation-list.component.html',
})
export class FinancialObligationListComponent {
  obligations = input.required<FinancialObligation[]>();
  totalRecords = input.required<number>();
  first = input.required<number>();
  pageSize = input.required<number>();
  isListLoading = input.required<boolean>();
  entityPlural = input.required<string>();
  partyLabel = input.required<string>();
  sourceLabel = input.required<string>();
  sourceDisplayKey = input.required<'purchaseNumber' | 'orderNumber'>();
  viewLabel = input('View Details');
  pageSizeOptions = input<number[]>(DEFAULT_PAGE_SIZE_OPTIONS);
  currencyCode = input<string>(DEFAULT_CURRENCY_CODE);

  readonly skeletonColumns = DEFAULT_LIST_SKELETON_COLUMNS;

  viewObligation = output<FinancialObligation>();
  pageChange = output<PaginatorPageEvent>();
  clearFilters = output<void>();

  statusLabel(status: FinancialObligationStatus): string {
    return financialObligationStatusLabel(status);
  }

  statusSeverity(
    status: FinancialObligationStatus,
  ): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
    return financialObligationStatusSeverity(status);
  }

  sourceDisplay(obligation: FinancialObligation): string {
    const source = obligation.source;
    return (
      (this.sourceDisplayKey() === 'purchaseNumber'
        ? source?.purchaseNumber
        : source?.orderNumber) ?? obligation.sourceId
    );
  }
}
