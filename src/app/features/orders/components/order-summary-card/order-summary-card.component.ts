import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CardModule } from 'primeng/card';

import { getOrderStatusUserLabel, getOrderStatusSeverity } from '../../models/order-actions';
import type { UiOrder } from '../../models/order-ui.model';
import { OrderSummaryPricesComponent } from './order-summary-prices.component';
import { OrderSummaryPaymentComponent } from './order-summary-payment.component';
import { OrderSummaryReferencesComponent } from './order-summary-references.component';

@Component({
  selector: 'app-order-summary-card',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    RouterLink,
    OrderSummaryPricesComponent,
    OrderSummaryPaymentComponent,
    OrderSummaryReferencesComponent
  ],
  templateUrl: './order-summary-card.component.html'
})
export class OrderSummaryCardComponent {
  readonly order = input.required<UiOrder>();
  readonly currencyCode = input<string>('EGP');

  readonly statusUserLabel = computed(() => getOrderStatusUserLabel(this.order().status));
  readonly statusSeverity = computed(() => getOrderStatusSeverity(this.order().status));
}
