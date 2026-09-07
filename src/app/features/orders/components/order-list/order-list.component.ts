import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { SurfaceCardComponent } from '../../../../shared/ui/surface-card/surface-card.component';
import type { UiOrder } from '../../models/order-ui.model';
import { OrderStatus } from '../../models/order.entity';
import {
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
      case OrderStatus.Processing:
        return 'info';
      case OrderStatus.Revision:
      case OrderStatus.RevisionPending:
        return 'warn';
      case OrderStatus.Pending:
        return 'secondary';
      case OrderStatus.Cancelled:
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

  customerDisplayName(order: UiOrder): string {
    const name = order.customerName?.trim();
    return name ? name : 'No customer on file';
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

  /** Icon for payment status inline display — uses existing PrimeIcons (no new library). */
  getPaymentStatusIcon(status: PaymentStatus | undefined): string {
    if (status === undefined) return 'pi pi-minus';
    switch (status) {
      case PaymentStatus.Paid:
        return 'pi pi-check-circle';
      case PaymentStatus.Partial:
        return 'pi pi-clock';
      case PaymentStatus.Unpaid:
      default:
        return 'pi pi-times-circle';
    }
  }

  /** Tailwind text class for payment status — reuses existing --c-* tokens via text-* utilities. */
  getPaymentStatusTextClass(status: PaymentStatus | undefined): string {
    if (status === undefined) return 'text-muted-foreground';
    switch (status) {
      case PaymentStatus.Paid:
        return 'text-success';
      case PaymentStatus.Partial:
        return 'text-warning';
      case PaymentStatus.Unpaid:
      default:
        return 'text-muted-foreground';
    }
  }

  /** Icon for payment type plain-text display — secondary text, not status/badge classes. */
  getPaymentTypeIcon(type: PaymentType | undefined): string {
    if (type === undefined) return 'pi pi-minus';
    switch (type) {
      case PaymentType.Immediate:
        return 'pi pi-bolt';
      case PaymentType.Debt:
        return 'pi pi-credit-card';
      default:
        return 'pi pi-wallet';
    }
  }

  /** Tailwind text class for payment type — reuses existing --c-* tokens via text-* utilities. Immediate=primary (sky), Debt=warning (amber). */
  getPaymentTypeTextClass(type: PaymentType | undefined): string {
    if (type === undefined) return 'text-muted-foreground';
    switch (type) {
      case PaymentType.Immediate:
        return 'text-primary';
      case PaymentType.Debt:
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  }
}
