import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';

import type { UiOrder } from '../../models/order-ui.model';

@Component({
  selector: 'app-order-details-return-items-tab',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, TableModule],
  templateUrl: './order-details-return-items-tab.component.html'
})
export class OrderDetailsReturnItemsTabComponent {
  readonly order = input.required<UiOrder>();
  readonly currencyCode = input<string>('EGP');
  private readonly router = inject(Router);

  navigateToReturn(): void {
    const returnId = this.order().returnId;
    if (returnId) {
      void this.router.navigate(['/returns', returnId]);
    }
  }
}
