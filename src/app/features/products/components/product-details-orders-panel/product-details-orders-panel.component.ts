import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';

import { getOrderStatusSeverity } from '../../../orders/models/order-actions';
import type { OrderStatus } from '../../../orders/models/order.entity';
import type {
  ProductOrderRowSummary,
  ProductOrdersAggregateSummary,
} from '../../models/product-order-summary';

@Component({
  selector: 'app-product-details-orders-panel',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, SkeletonModule],
  templateUrl: './product-details-orders-panel.component.html',
})
export class ProductDetailsOrdersPanelComponent {
  readonly rows = input.required<ProductOrderRowSummary[]>();
  readonly aggregate = input.required<ProductOrdersAggregateSummary>();
  readonly loading = input(false);
  readonly currencyCode = input<string>('EGP');

  readonly viewOrder = output<ProductOrderRowSummary>();
  readonly reload = output<void>();

  readonly hasRows = computed(() => this.rows().length > 0);

  statusSeverity(status: OrderStatus): string {
    return getOrderStatusSeverity(status);
  }
}
