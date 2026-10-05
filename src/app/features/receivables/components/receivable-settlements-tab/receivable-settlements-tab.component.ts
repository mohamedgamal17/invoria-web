import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';

import { SurfaceCardComponent } from '../../../../shared/ui/surface-card/surface-card.component';
import type { ReceivableSettlement } from '../../models/receivable.entity';

@Component({
  selector: 'app-receivable-settlements-tab',
  standalone: true,
  imports: [CommonModule, TableModule, SurfaceCardComponent],
  templateUrl: './receivable-settlements-tab.component.html'
})
export class ReceivableSettlementsTabComponent {
  settlements = input<ReceivableSettlement[]>([]);
  currencyCode = input<string>('EGP');

  readonly safeSettlements = computed(() => this.settlements() ?? []);

  readonly totalSettled = computed(() =>
    this.safeSettlements().reduce((sum, s) => sum + s.amount, 0)
  );

  readonly hasSettlements = computed(() => this.safeSettlements().length > 0);
}
