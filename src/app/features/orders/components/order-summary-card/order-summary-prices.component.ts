import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import type { UiOrder } from '../../models/order-ui.model';

@Component({
  selector: 'app-order-summary-prices',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-summary-prices.component.html',
})
export class OrderSummaryPricesComponent {
  readonly order = input.required<UiOrder>();
  readonly currencyCode = input<string>('EGP');

  readonly subtotal = computed(() =>
    this.order().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );
}
