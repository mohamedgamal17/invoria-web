import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { PopoverModule } from 'primeng/popover';
import { TimelineModule } from 'primeng/timeline';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { SurfaceCardComponent } from '../../../../shared/ui/surface-card/surface-card.component';
import type { UiOrder } from '../../models/order-ui.model';
import { OrderFullfillmentStatus } from '../../models/order.entity';
import { OrderStatus } from '../../models/order.entity';
import {
  friendlyFullfillmentStatusLabel,
  orderStatusLabel
} from '../../models/order-actions';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    PaginatorModule,
    SkeletonModule,
    PopoverModule,
    TimelineModule,
    EmptyStateComponent,
    SurfaceCardComponent
  ],
  templateUrl: './order-list.component.html'
})
export class OrderListComponent {
  orders = input<UiOrder[]>([]);
  totalRecords = input(0);
  first = input(0);
  pageSize = input(10);
  pageSizeOptions = input([5, 10, 20]);
  loading = input(false);
  /** When false, delete actions are hidden (no backend delete for orders yet). */
  showDelete = input(false);
  /** Server-side order number filter (from URL `q`); drives search input value. */
  orderNumberFilter = input<string>('');

  pageChange = output<any>();
  view = output<UiOrder>();
  delete = output<UiOrder>();
  orderNumberFilterChange = output<string>();

  get skeletonRows(): number[] {
    return Array.from({ length: this.pageSize() }, (_, i) => i);
  }

  getStatusSeverity(status: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'ACCEPTED': return 'info';
      case 'REOPENED': return 'warn';
      case 'PENDING': return 'secondary';
      case 'CANCELLED':
      case 'REFUSED': return 'danger';
      default: return 'secondary';
    }
  }

  statusLabel(status: OrderStatus): string {
    return orderStatusLabel(status);
  }

  shouldShowFulfillment(order: UiOrder): boolean {
    return order.status !== OrderStatus.Cancelled;
  }

  fullfillmentLabel(status: OrderFullfillmentStatus): string {
    return friendlyFullfillmentStatusLabel(status);
  }

  getFulfillmentSeverity(
    status: OrderFullfillmentStatus
  ): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    switch (status) {
      case OrderFullfillmentStatus.Allocated:
        return 'success';
      case OrderFullfillmentStatus.Allocating:
      case OrderFullfillmentStatus.Releasing:
        return 'info';
      case OrderFullfillmentStatus.OnHold:
        return 'warn';
      case OrderFullfillmentStatus.Dispatched:
        return 'contrast';
      case OrderFullfillmentStatus.Cancelled:
        return 'danger';
      case OrderFullfillmentStatus.Pending:
      default:
        return 'secondary';
    }
  }
}
