import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createClipboardNotifier } from '../../../../shared/utils/clipboard';
import type { UiOrder } from '../../models/order-ui.model';

@Component({
  selector: 'app-order-summary-references',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-summary-references.component.html',
})
export class OrderSummaryReferencesComponent {
  readonly order = input.required<UiOrder>();

  private readonly clipboard = createClipboardNotifier();
  readonly copiedKey = this.clipboard.copiedKey;

  copy(value: string, key: string): void {
    this.clipboard.copy(value, key);
  }
}
