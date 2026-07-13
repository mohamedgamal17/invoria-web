import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import type { UiOrder } from '../../models/order-ui.model';

@Component({
  selector: 'app-order-summary-prices',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Financial Summary</div>
    <div class="rounded-lg border border-border/60 bg-muted/20 divide-y divide-border/40">
      <div class="flex items-center justify-between gap-4 px-4 py-3">
        <span class="text-sm text-muted-foreground">Subtotal</span>
        <span class="text-base font-semibold tabular-nums text-foreground">
          {{ order().totalAmount | currency: currencyCode() : 'symbol-narrow' }}
        </span>
      </div>
      @if (order().returnsTotal > 0) {
        <div class="flex items-center justify-between gap-4 px-4 py-3">
          <span class="text-sm text-muted-foreground">Returns</span>
          <span class="text-base font-semibold tabular-nums text-danger">
            &minus;{{ order().returnsTotal | currency: currencyCode() : 'symbol-narrow' }}
          </span>
        </div>
      }
      <div class="flex items-center justify-between gap-4 px-4 py-4">
        <span class="text-sm font-bold text-foreground">Net Total</span>
        <span class="text-xl font-bold tabular-nums text-primary">
          {{ order().netOfTotalOrderAmount | currency: currencyCode() : 'symbol-narrow' }}
        </span>
      </div>
    </div>
  `
})
export class OrderSummaryPricesComponent {
  readonly order = input.required<UiOrder>();
  readonly currencyCode = input<string>('EGP');
}
