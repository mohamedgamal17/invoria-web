import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';

import { DEFAULT_CURRENCY_CODE } from '../../../../shared/models/currency';
import { SurfaceCardComponent } from '../../../../shared/ui/surface-card/surface-card.component';
import { createClipboardNotifier } from '../../../../shared/utils/clipboard';
import type { Invoice } from '../../models/invoice.entity';

@Component({
  selector: 'app-invoice-details-overview-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    DividerModule,
    TooltipModule,
    ButtonModule,
    SurfaceCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './invoice-details-overview-card.component.html',
})
export class InvoiceDetailsOverviewCardComponent {
  invoice = input.required<Invoice>();
  currencyCode = input<string>(DEFAULT_CURRENCY_CODE);

  private readonly clipboard = createClipboardNotifier();
  readonly copiedKey = this.clipboard.copiedKey;

  copy(value: string, key: string): void {
    this.clipboard.copy(value, key);
  }
}
