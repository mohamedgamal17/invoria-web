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
import type { OrderState } from '../../models/order-state-machine';
import { canEditOrder, canTransition } from '../../models/order-state-machine';

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

  pageChange = output<any>();
  edit = output<UiOrder>();
  accept = output<UiOrder>();
  cancel = output<UiOrder>();
  reopen = output<UiOrder>();
  complete = output<UiOrder>();
  refuse = output<UiOrder>();
  delete = output<UiOrder>();

  get skeletonRows(): number[] {
    return Array.from({ length: this.pageSize() }, (_, i) => i);
  }

  canEdit(order: UiOrder): boolean {
    return canEditOrder(order.status);
  }

  canAccept(order: UiOrder): boolean {
    return canTransition(order.status, 'ACCEPTED');
  }

  canCancel(order: UiOrder): boolean {
    return canTransition(order.status, 'CANCELLED');
  }

  canReopen(order: UiOrder): boolean {
    return canTransition(order.status, 'REOPENED');
  }

  canComplete(order: UiOrder): boolean {
    return canTransition(order.status, 'COMPLETED');
  }

  canRefuse(order: UiOrder): boolean {
    return canTransition(order.status, 'REFUSED');
  }

  getStatusSeverity(status: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    switch (status as OrderState) {
      case 'COMPLETED': return 'success';
      case 'ACCEPTED': return 'info';
      case 'REOPENED': return 'warn';
      case 'PENDING': return 'secondary';
      case 'CANCELLED':
      case 'REFUSED': return 'danger';
      default: return 'secondary';
    }
  }
}
