import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

import { DEFAULT_CURRENCY_CODE } from '@invoria/utils';
import type { FinancialSettlement } from '@invoria/utils';
import { SurfaceCardComponent } from '../surface-card/surface-card.component';

@Component({
  selector: 'app-settlements-tab',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, SurfaceCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './settlements-tab.component.html',
})
export class SettlementsTabComponent {
  settlements = input<FinancialSettlement[]>([]);
  currencyCode = input<string>(DEFAULT_CURRENCY_CODE);
  /** Outstanding amount of the parent obligation; 0 hides the settle action. */
  outstandingAmount = input<number>(0);
  /** Display noun in the empty state (e.g., 'payable', 'receivable'). */
  entityName = input<string>('record');

  /** Emitted when the user wants to open the settle modal. */
  settleRequest = output<void>();

  /** Newest first, so freshly recorded settlements appear at the top. */
  readonly safeSettlements = computed(() =>
    [...(this.settlements() ?? [])].sort(
      (left: FinancialSettlement, right: FinancialSettlement) =>
        new Date(right.settledAt).getTime() - new Date(left.settledAt).getTime(),
    ),
  );

  readonly totalSettled = computed(() =>
    this.safeSettlements().reduce((accumulator, settlement) => accumulator + settlement.amount, 0),
  );

  readonly hasSettlements = computed(() => this.safeSettlements().length > 0);
}
