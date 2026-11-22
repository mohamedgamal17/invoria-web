import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import type { PagingInfo } from '@invoria/core';
import {
  DEFAULT_PAGE_SIZE_OPTIONS,
  type PaginatorPageEvent,
} from '@invoria/utils';
import { OrdersFilterPanelComponent } from '@invoria/sales';
import type { OrdersListFilters } from '@invoria/sales';
import { OrderListComponent } from '@invoria/sales';
import type { UiOrder } from '@invoria/sales';

@Component({
  selector: 'app-customer-details-orders-tab',
  standalone: true,
  imports: [CommonModule, OrdersFilterPanelComponent, OrderListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './customer-details-orders-tab.component.html',
})
export class CustomerDetailsOrdersTabComponent {
  readonly pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS;

  /** Current filter values, mirrored from the owning page. */
  readonly orderNumber = input<string>('');
  readonly orderStatusFilter = input<number | null>(null);
  readonly paymentStatusFilter = input<number | null>(null);
  readonly paymentTypeFilter = input<number | null>(null);

  /** Data inputs provided by the owning page. */
  readonly orders = input<UiOrder[]>([]);
  readonly paging = input<PagingInfo>({ length: 0, skip: 0, totalCount: 0 });
  readonly first = input(0);
  readonly pageSize = input(25);
  readonly loading = input(false);

  readonly pageChange = output<PaginatorPageEvent>();
  readonly filtersChange = output<OrdersListFilters>();
  readonly clearFilters = output<void>();
  readonly view = output<UiOrder>();

  onPageChange(event: PaginatorPageEvent): void {
    this.pageChange.emit(event);
  }

  onFiltersChange(filters: OrdersListFilters): void {
    this.filtersChange.emit(filters);
  }

  onClearFilters(): void {
    this.clearFilters.emit();
  }

  goToDetails(order: UiOrder): void {
    this.view.emit(order);
  }
}
