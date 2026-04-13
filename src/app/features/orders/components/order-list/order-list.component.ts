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
import type { UiOrder } from '../../models/order-ui.model';
import { OrderFullfillmentStatus } from '../../models/order.entity';
import { OrderStatus } from '../../models/order.entity';
import {
  friendlyFullfillmentStatusLabel,
  getAvailableOrderActions,
  getPrimaryOrderAction,
  type OrderActionKey,
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
    TimelineModule
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

  pageChange = output<any>();
  edit = output<UiOrder>();
  accept = output<UiOrder>();
  dispatch = output<UiOrder>();
  cancel = output<UiOrder>();
  reopen = output<UiOrder>();
  complete = output<UiOrder>();
  refuse = output<UiOrder>();
  delete = output<UiOrder>();

  get skeletonRows(): number[] {
    return Array.from({ length: this.pageSize() }, (_, i) => i);
  }

  primaryAction(order: UiOrder): OrderActionKey | null {
    return getPrimaryOrderAction(order);
  }

  secondaryActions(order: UiOrder): OrderActionKey[] {
    const primary = this.primaryAction(order);
    return getAvailableOrderActions(order).filter((action) => action !== primary);
  }

  actionLabel(action: OrderActionKey): string {
    switch (action) {
      case 'accept':
        return 'Accept';
      case 'dispatch':
        return 'Dispatch';
      case 'complete':
        return 'Complete';
      case 'cancel':
        return 'Cancel';
      case 'reopen':
        return 'Reopen';
      case 'refuse':
        return 'Refuse';
      case 'edit':
        return 'Edit';
      default:
        return 'Action';
    }
  }

  actionIcon(action: OrderActionKey): string {
    switch (action) {
      case 'accept':
        return 'pi pi-check';
      case 'dispatch':
        return 'pi pi-truck';
      case 'complete':
        return 'pi pi-check-circle';
      case 'cancel':
        return 'pi pi-times';
      case 'reopen':
        return 'pi pi-refresh';
      case 'refuse':
        return 'pi pi-ban';
      case 'edit':
        return 'pi pi-pencil';
      default:
        return 'pi pi-cog';
    }
  }

  actionSeverity(action: OrderActionKey): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    switch (action) {
      case 'accept':
      case 'complete':
        return 'success';
      case 'dispatch':
        return 'info';
      case 'reopen':
        return 'warn';
      case 'cancel':
      case 'refuse':
        return 'danger';
      case 'edit':
      default:
        return 'secondary';
    }
  }

  actionTooltip(action: OrderActionKey): string {
    switch (action) {
      case 'accept':
        return 'Recommended next step: accept order';
      case 'dispatch':
        return 'Recommended next step: dispatch order';
      case 'complete':
        return 'Recommended next step: mark order completed';
      case 'cancel':
        return 'Cancel order';
      case 'reopen':
        return 'Reopen order';
      case 'refuse':
        return 'Mark order as refused';
      case 'edit':
        return 'Edit order';
      default:
        return 'Order action';
    }
  }

  triggerAction(action: OrderActionKey, order: UiOrder): void {
    switch (action) {
      case 'accept':
        this.accept.emit(order);
        break;
      case 'dispatch':
        this.dispatch.emit(order);
        break;
      case 'complete':
        this.complete.emit(order);
        break;
      case 'cancel':
        this.cancel.emit(order);
        break;
      case 'reopen':
        this.reopen.emit(order);
        break;
      case 'refuse':
        this.refuse.emit(order);
        break;
      case 'edit':
        this.edit.emit(order);
        break;
      default:
        break;
    }
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
