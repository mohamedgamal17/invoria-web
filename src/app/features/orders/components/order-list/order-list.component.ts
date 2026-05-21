import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
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
  orderStatusLabel,
  orderStatusUserLabel
} from '../../models/order-actions';
import {
  PaymentStatus,
  PaymentType,
  paymentStatusLabel,
  paymentTypeLabel
} from '../../models/order-payment.enums';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    TooltipModule,
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
  /** Expose enum to templates (e.g. delete button visibility). */
  readonly OrderStatus = OrderStatus;

  orders = input<UiOrder[]>([]);
  totalRecords = input(0);
  first = input(0);
  pageSize = input(10);
  pageSizeOptions = input([5, 10, 20]);
  loading = input(false);
  /** When false, delete actions are hidden (no backend delete for orders yet). */
  showDelete = input(false);
  pageChange = output<any>();
  view = output<UiOrder>();
  delete = output<UiOrder>();
  clearFilters = output<void>();

  get skeletonRows(): number[] {
    return Array.from({ length: this.pageSize() }, (_, i) => i);
  }

  getOrderStatusSeverity(
    status: OrderStatus
  ): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    switch (status) {
      case OrderStatus.Completed:
        return 'success';
      case OrderStatus.Accepted:
        return 'info';
      case OrderStatus.Shipped:
        return 'contrast';
      case OrderStatus.Reopened:
        return 'warn';
      case OrderStatus.Pending:
        return 'secondary';
      case OrderStatus.Cancelled:
      case OrderStatus.Refused:
        return 'danger';
      default:
        return 'secondary';
    }
  }

  statusLabel(status: OrderStatus): string {
    return orderStatusLabel(status);
  }

  statusUserLabel(status: OrderStatus): string {
    return orderStatusUserLabel(status);
  }

  /** Mobile card: explicit, non-empty line so the customer is never an ambiguous blank. */
  customerDisplayName(order: UiOrder): string {
    const name = order.customerName?.trim();
    return name ? name : 'No customer on file';
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

  paymentTypeDisplay(type: PaymentType | undefined): string {
    return type !== undefined ? paymentTypeLabel(type) : '—';
  }

  paymentStatusDisplay(status: PaymentStatus | undefined): string {
    return status !== undefined ? paymentStatusLabel(status) : '—';
  }

  getPaymentStatusSeverity(
    status: PaymentStatus | undefined
  ): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    if (status === undefined) return 'secondary';
    switch (status) {
      case PaymentStatus.Paid:
        return 'success';
      case PaymentStatus.Partial:
        return 'warn';
      case PaymentStatus.Unpaid:
      default:
        return 'secondary';
    }
  }

  getPaymentTypeSeverity(
    type: PaymentType | undefined
  ): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    if (type === undefined) return 'secondary';
    switch (type) {
      case PaymentType.Immediate:
        return 'info';
      case PaymentType.Debt:
        return 'warn';
      default:
        return 'secondary';
    }
  }
}
