import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

import { SurfaceCardComponent } from '../../../../shared/ui/surface-card/surface-card.component';
import type { ReceivableSettlement } from '../../models/receivable.entity';

@Component({
  selector: 'app-receivable-settlements-tab',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, SurfaceCardComponent],
  templateUrl: './receivable-settlements-tab.component.html'
})
export class ReceivableSettlementsTabComponent {
  settlements = input<ReceivableSettlement[]>([]);
  currencyCode = input<string>('EGP');
  /** Outstanding amount of the parent receivable; 0 hides the settle action. */
  outstandingAmount = input<number>(0);

  /** Emitted when the user wants to open the settle modal. */
  settleRequest = output<void>();

  /** Newest first, so freshly recorded settlements appear at the top. */
  readonly safeSettlements = computed(() =>
    [...(this.settlements() ?? [])].sort(
      (a: ReceivableSettlement, b: ReceivableSettlement) =>
        new Date(b.settledAt).getTime() - new Date(a.settledAt).getTime()
    )
  );

  readonly totalSettled = computed(() =>
    this.safeSettlements().reduce((sum, s) => sum + s.amount, 0)
  );

  readonly hasSettlements = computed(() => this.safeSettlements().length > 0);
}
