import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import type { PagingInfo } from '../../../../core/models/paging';
import {
  DEFAULT_PAGE_SIZE_OPTIONS,
  type PaginatorPageEvent,
} from '../../../../shared/models/pagination';
import { PurchaseOrderListComponent } from '../../../procurement/components/purchase-order-list/purchase-order-list.component';
import {
  PurchaseOrdersFilterPanelComponent,
  type PurchaseOrdersListFilters,
} from '../../../procurement/components/purchase-orders-filter-panel/purchase-orders-filter-panel.component';
import type { PurchaseOrder } from '../../../procurement/models/purchase-order.entity';

@Component({
  selector: 'app-supplier-details-purchase-orders-tab',
  standalone: true,
  imports: [CommonModule, PurchaseOrdersFilterPanelComponent, PurchaseOrderListComponent],
  templateUrl: './supplier-details-purchase-orders-tab.component.html',
})
export class SupplierDetailsPurchaseOrdersTabComponent {
  readonly pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS;

  /** Current filter values, mirrored from the owning page. */
  readonly purchaseNumber = input<string>('');
  readonly statusFilter = input<number | null>(null);

  /** Data inputs provided by the owning page (supplier-details-purchase-orders store). */
  readonly purchaseOrders = input<PurchaseOrder[]>([]);
  readonly paging = input<PagingInfo>({ length: 0, skip: 0, totalCount: 0 });
  readonly first = input(0);
  readonly pageSize = input(25);
  readonly loading = input(false);

  readonly pageChange = output<PaginatorPageEvent>();
  readonly filtersChange = output<PurchaseOrdersListFilters>();
  readonly clearFilters = output<void>();
  readonly view = output<PurchaseOrder>();

  onPageChange(event: PaginatorPageEvent): void {
    this.pageChange.emit(event);
  }

  onFiltersChange(filters: PurchaseOrdersListFilters): void {
    this.filtersChange.emit(filters);
  }

  onClearFilters(): void {
    this.clearFilters.emit();
  }

  goToDetails(purchaseOrder: PurchaseOrder): void {
    this.view.emit(purchaseOrder);
  }
}
