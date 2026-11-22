import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';

import { DEFAULT_CURRENCY_CODE } from '@invoria/utils';
import type { OrderItem } from '@invoria/sales/orders/models/order.entity';
import type { UiOrder } from '@invoria/sales/orders/models/order-ui.model';

@Component({
  selector: 'app-order-details-line-items-tab',
  standalone: true,
  imports: [CommonModule, CardModule, TableModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-details-line-items-tab.component.html'
})
export class OrderDetailsLineItemsTabComponent {
  readonly order = input.required<UiOrder>();
  readonly currencyCode = input<string>(DEFAULT_CURRENCY_CODE);

  lineTotal(item: OrderItem): number {
    return item.price * item.quantity;
  }

  subtotal(order: UiOrder): number {
    return order.items.reduce((accumulator, item) => accumulator + this.lineTotal(item), 0);
  }

  itemCount(order: UiOrder): number {
    return order.items.length;
  }

  subtotalDiffersFromTotal(order: UiOrder): boolean {
    return Math.abs(this.subtotal(order) - order.netOfTotalOrderAmount) > 0.01;
  }
}
