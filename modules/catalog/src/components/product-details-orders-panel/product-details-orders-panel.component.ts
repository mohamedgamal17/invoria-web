import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';

import { DEFAULT_CURRENCY_CODE } from '@invoria/utils';
import { getOrderStatusSeverity } from '@invoria/sales';
import type { OrderStatus } from '@invoria/sales';
import type {
  ProductOrderRowSummary,
  ProductOrdersAggregateSummary,
} from '@invoria/catalog/models/product-order-summary';

@Component({
  selector: 'app-product-details-orders-panel',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, SkeletonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-details-orders-panel.component.html',
})
export class ProductDetailsOrdersPanelComponent {
  readonly rows = input.required<ProductOrderRowSummary[]>();
  readonly aggregate = input.required<ProductOrdersAggregateSummary>();
  readonly loading = input(false);
  readonly currencyCode = input<string>(DEFAULT_CURRENCY_CODE);

  readonly viewOrder = output<ProductOrderRowSummary>();
  readonly reload = output<void>();

  readonly hasRows = computed(() => this.rows().length > 0);

  statusSeverity(status: OrderStatus): string {
    return getOrderStatusSeverity(status);
  }
}
