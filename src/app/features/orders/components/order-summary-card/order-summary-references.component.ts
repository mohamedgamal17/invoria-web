import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { UiOrder } from '../../models/order-ui.model';

@Component({
  selector: 'app-order-summary-references',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-summary-references.component.html',
})
export class OrderSummaryReferencesComponent {
  readonly order = input.required<UiOrder>();

  readonly copiedKey = signal<string | null>(null);

  copy(value: string, key: string): void {
    navigator.clipboard.writeText(value);
    this.copiedKey.set(key);
    setTimeout(() => {
      this.copiedKey.set(null);
    }, 500);
  }
}
