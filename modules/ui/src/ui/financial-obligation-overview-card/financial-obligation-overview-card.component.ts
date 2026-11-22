import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { DEFAULT_CURRENCY_CODE } from '@invoria/utils';
import {
  type FinancialObligationStatus,
  financialObligationStatusLabel,
  financialObligationStatusSeverity,
} from '@invoria/utils';
import type { FinancialObligation } from '@invoria/utils';
import { SurfaceCardComponent } from '../surface-card/surface-card.component';
import { createClipboardNotifier } from '@invoria/utils';

@Component({
  selector: 'app-financial-obligation-overview-card',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, TagModule, TooltipModule, SurfaceCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './financial-obligation-overview-card.component.html',
})
export class FinancialObligationOverviewCardComponent {
  obligation = input.required<FinancialObligation>();
  entityLabel = input.required<string>();
  partyLabel = input.required<string>();
  sourceLabel = input.required<string>();
  partyRoute = input.required<string>();
  sourceRoute = input.required<string>();
  sourceDisplayKey = input.required<'purchaseNumber' | 'orderNumber'>();
  currencyCode = input<string>(DEFAULT_CURRENCY_CODE);

  settleRequest = output<void>();

  private readonly clipboard = createClipboardNotifier();
  readonly copiedKey = this.clipboard.copiedKey;

  copy(value: string, key: string): void {
    this.clipboard.copy(value, key);
  }

  sourceDisplay(obligation: FinancialObligation): string {
    const source = obligation.source;
    return (
      (this.sourceDisplayKey() === 'purchaseNumber'
        ? source?.purchaseNumber
        : source?.orderNumber) ?? obligation.sourceId
    );
  }

  statusLabel(status: FinancialObligationStatus): string {
    return financialObligationStatusLabel(status);
  }

  statusSeverity(
    status: FinancialObligationStatus,
  ): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
    return financialObligationStatusSeverity(status);
  }
}
