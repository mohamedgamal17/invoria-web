import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DEFAULT_CURRENCY_CODE } from '../../../../shared/models/currency';
import type { UiOrder } from '../../models/order-ui.model';

@Component({
  selector: 'app-order-summary-prices',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-summary-prices.component.html',
})
export class OrderSummaryPricesComponent {
  readonly order = input.required<UiOrder>();
  readonly currencyCode = input<string>(DEFAULT_CURRENCY_CODE);

  readonly subtotal = computed(() =>
    this.order().items.reduce((accumulator, item) => accumulator + item.price * item.quantity, 0),
  );
}
