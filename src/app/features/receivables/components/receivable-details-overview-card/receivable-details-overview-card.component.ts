import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';

import { DEFAULT_CURRENCY_CODE } from '../../../../shared/models/currency';
import { SurfaceCardComponent } from '../../../../shared/ui/surface-card/surface-card.component';
import type { Receivable } from '../../models/receivable.entity';
import {
  type FinancialObligationStatus,
  financialObligationStatusLabel,
  financialObligationStatusSeverity
} from '../../../../shared/models/financial-obligation-status';

@Component({
  selector: 'app-receivable-details-overview-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    DividerModule,
    TagModule,
    TooltipModule,
    ButtonModule,
    SurfaceCardComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './receivable-details-overview-card.component.html'
})
export class ReceivableDetailsOverviewCardComponent {
  receivable = input.required<Receivable>();
  currencyCode = input<string>(DEFAULT_CURRENCY_CODE);

  /** Emitted when the user wants to open the settle modal. */
  settleRequest = output<void>();

  readonly copiedKey = signal<string | null>(null);

  copy(value: string, key: string): void {
    navigator.clipboard.writeText(value);
    this.copiedKey.set(key);
    setTimeout(() => this.copiedKey.set(null), 500);
  }

  statusLabel(status: FinancialObligationStatus): string {
    return financialObligationStatusLabel(status);
  }

  statusSeverity(
    status: FinancialObligationStatus
  ): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
    return financialObligationStatusSeverity(status);
  }
}
