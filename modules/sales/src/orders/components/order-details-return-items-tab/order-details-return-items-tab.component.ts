import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';

import { DEFAULT_CURRENCY_CODE } from '@invoria/utils';
import type { UiOrder } from '@invoria/sales/orders/models/order-ui.model';

@Component({
  selector: 'app-order-details-return-items-tab',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, TableModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-details-return-items-tab.component.html'
})
export class OrderDetailsReturnItemsTabComponent {
  readonly order = input.required<UiOrder>();
  readonly currencyCode = input<string>(DEFAULT_CURRENCY_CODE);

  readonly viewReturn = output<string>();

  navigateToReturn(): void {
    const returnId = this.order().returnId;
    if (returnId) {
      this.viewReturn.emit(returnId);
    }
  }
}
