import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

import { SurfaceCardComponent } from '../../../../shared/ui/surface-card/surface-card.component';
import type { PayableSettlement } from '../../models/payable.entity';

@Component({
  selector: 'app-payable-settlements-tab',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, SurfaceCardComponent],
  templateUrl: './payable-settlements-tab.component.html'
})
export class PayableSettlementsTabComponent {
  settlements = input<PayableSettlement[]>([]);
  currencyCode = input<string>('EGP');
  /** Outstanding amount of the parent payable; 0 hides the settle action. */
  outstandingAmount = input<number>(0);

  /** Emitted when the user wants to open the settle modal. */
  settleRequest = output<void>();

  /** Newest first, so freshly recorded settlements appear at the top. */
  readonly safeSettlements = computed(() =>
    [...(this.settlements() ?? [])].sort(
      (a: PayableSettlement, b: PayableSettlement) =>
        new Date(b.settledAt).getTime() - new Date(a.settledAt).getTime()
    )
  );

  readonly totalSettled = computed(() =>
    this.safeSettlements().reduce((sum, s) => sum + s.amount, 0)
  );

  readonly hasSettlements = computed(() => this.safeSettlements().length > 0);
}
