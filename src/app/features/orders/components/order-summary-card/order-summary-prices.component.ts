import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import type { UiOrder } from '../../models/order-ui.model';

@Component({
  selector: 'app-order-summary-prices',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Financial Summary</div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1">
        <div class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Order</div>
        <div class="text-xl font-bold tabular-nums text-foreground">
          {{ order().totalAmount | currency: currencyCode() : 'symbol-narrow' }}
        </div>
      </div>
      <div class="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1">
        <div class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Net of Returns</div>
        <div class="text-xl font-bold tabular-nums text-foreground">
          {{ order().netOfTotalOrderAmount | currency: currencyCode() : 'symbol-narrow' }}
        </div>
      </div>
      <div class="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1">
        <div class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Returns Total</div>
        <div class="text-xl font-bold tabular-nums" [class.text-foreground]="order().returnsTotal > 0" [class.text-muted-foreground]="!order().returnsTotal">
          {{ order().returnsTotal | currency: currencyCode() : 'symbol-narrow' }}
        </div>
      </div>
    </div>
  `
})
export class OrderSummaryPricesComponent {
  readonly order = input.required<UiOrder>();
  readonly currencyCode = input<string>('EGP');
}
