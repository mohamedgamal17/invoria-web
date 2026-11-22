import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';

import type { PurchaseOrder } from '@invoria/procurement/purchase-orders/models/purchase-order.entity';
import { purchaseStateLabel, purchaseStateSeverity } from '@invoria/procurement/purchase-orders/models/purchase-state.display';
import {
  DEFAULT_PAGE_SIZE_OPTIONS,
  type PaginatorPageEvent,
} from '@invoria/utils';
import { DEFAULT_CURRENCY_CODE } from '@invoria/utils';
import { EmptyStateComponent } from '@invoria/ui';
import {
  ListSkeletonComponent,
  type ListSkeletonColumn,
} from '@invoria/ui';

@Component({
  selector: 'app-purchase-order-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    PaginatorModule,
    EmptyStateComponent,
    ListSkeletonComponent,
  ],
  templateUrl: './purchase-order-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseOrderListComponent {
  protected readonly currencyCode = signal(DEFAULT_CURRENCY_CODE);
  purchaseOrders = input<PurchaseOrder[]>([]);
  totalRecords = input(0);
  first = input(0);
  pageSize = input(25);
  pageSizeOptions = input(DEFAULT_PAGE_SIZE_OPTIONS);
  loading = input(false);
  /** When false, hides the supplier column (e.g. supplier-scoped embedded lists). */
  showSupplierColumn = input(true);

  readonly tableColspan = computed(() => (this.showSupplierColumn() ? 6 : 5));

  pageChange = output<PaginatorPageEvent>();
  view = output<PurchaseOrder>();

  readonly stateLabel = purchaseStateLabel;
  readonly stateSeverity = purchaseStateSeverity;

  readonly skeletonColumns = computed<ListSkeletonColumn[]>(() => [
    { width: '40%' },
    ...(this.showSupplierColumn() ? [{ width: '55%' }] : []),
    { width: '4.5rem' },
    { width: '5rem' },
    { width: '4rem', align: 'right' as const },
    { width: '', actions: 1, align: 'right' as const },
  ]);

  supplierDisplay(row: PurchaseOrder): string {
    const name = row.supplier?.name?.trim();
    if (name) {
      return name;
    }
    return row.supplierId;
  }
}
