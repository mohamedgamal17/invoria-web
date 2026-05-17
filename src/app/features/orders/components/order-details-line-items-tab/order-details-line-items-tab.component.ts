import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';

import type { UiOrder, UiOrderItem } from '../../models/order-ui.model';

@Component({
  selector: 'app-order-details-line-items-tab',
  standalone: true,
  imports: [CommonModule, CardModule, TableModule],
  templateUrl: './order-details-line-items-tab.component.html'
})
export class OrderDetailsLineItemsTabComponent {
  readonly order = input.required<UiOrder>();
  readonly currencyCode = input<string>('EGP');

  lineTotal(item: UiOrderItem): number {
    return item.price * item.quantity;
  }

  subtotal(o: UiOrder): number {
    return o.items.reduce((acc, item) => acc + this.lineTotal(item), 0);
  }

  itemCount(o: UiOrder): number {
    return o.items.length;
  }

  subtotalDiffersFromTotal(o: UiOrder): boolean {
    return Math.abs(this.subtotal(o) - o.totalAmount) > 0.01;
  }
}
