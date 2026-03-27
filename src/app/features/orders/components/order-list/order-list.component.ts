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
import type { Order, OrderState } from '../../models/order';
import { canEditOrder, canTransition } from '../../models/order';

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
  templateUrl: './order-list.component.html',
  styles: [`
    :host ::ng-deep .p-paginator {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem 0.5rem;
    }
    :host ::ng-deep .p-paginator .p-dropdown {
      margin-left: auto;
      margin-right: auto;
      min-width: 4rem;
    }
    @media screen and (max-width: 641px) {
      :host ::ng-deep .p-paginator .p-paginator-pages {
        display: none;
      }
    }
  `]
})
export class OrderListComponent {
  orders = input<Order[]>([]);
  totalRecords = input(0);
  first = input(0);
  pageSize = input(10);
  pageSizeOptions = input([5, 10, 20]);
  loading = input(false);

  pageChange = output<any>();
  edit = output<Order>();
  accept = output<Order>();
  cancel = output<Order>();
  reopen = output<Order>();
  complete = output<Order>();
  refuse = output<Order>();
  delete = output<Order>();

  get skeletonRows(): number[] {
    return Array.from({ length: this.pageSize() }, (_, i) => i);
  }

  canEdit(order: Order): boolean {
    return canEditOrder(order.status);
  }

  canAccept(order: Order): boolean {
    return canTransition(order.status, 'ACCEPTED');
  }

  canCancel(order: Order): boolean {
    return canTransition(order.status, 'CANCELLED');
  }

  canReopen(order: Order): boolean {
    return canTransition(order.status, 'REOPENED');
  }

  canComplete(order: Order): boolean {
    return canTransition(order.status, 'COMPLETED');
  }

  canRefuse(order: Order): boolean {
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
