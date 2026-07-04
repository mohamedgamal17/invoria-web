import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { UiOrder } from '../../models/order-ui.model';

@Component({
  selector: 'app-order-summary-references',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">References</div>
    <div class="space-y-0 divide-y divide-border/40">

      <div class="flex items-center justify-between gap-2 py-2">
        <span class="text-xs font-medium text-muted-foreground shrink-0">Order ID</span>
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-xs font-mono text-foreground truncate">{{ order().id }}</span>
          <button
            type="button"
            class="shrink-0 w-7 h-7 flex items-center justify-center rounded-md hover:bg-surface-2 transition-colors text-muted-foreground hover:text-foreground"
            (click)="copy(order().id, 'id')"
            title="Copy Order ID"
          >
            <i [class]="copiedKey() === 'id' ? 'pi pi-check text-success' : 'pi pi-copy'" class="text-xs"></i>
          </button>
        </div>
      </div>

      @if (order().allocationId) {
        <div class="flex items-center justify-between gap-2 py-2">
          <span class="text-xs font-medium text-muted-foreground shrink-0">Allocation ID</span>
          <div class="flex items-center gap-2 min-w-0">
            <span class="text-xs font-mono text-primary truncate">{{ order().allocationId }}</span>
            <button
              type="button"
              class="shrink-0 w-7 h-7 flex items-center justify-center rounded-md hover:bg-surface-2 transition-colors text-muted-foreground hover:text-foreground"
              (click)="copy(order().allocationId!, 'allocationId')"
              title="Copy Allocation ID"
            >
              <i [class]="copiedKey() === 'allocationId' ? 'pi pi-check text-success' : 'pi pi-copy'" class="text-xs"></i>
            </button>
          </div>
        </div>
      }

      @if (order().returnId) {
        <div class="flex items-center justify-between gap-2 py-2">
          <span class="text-xs font-medium text-muted-foreground shrink-0">Return ID</span>
          <div class="flex items-center gap-2 min-w-0">
            <span class="text-xs font-mono text-primary truncate">{{ order().returnId }}</span>
            <button
              type="button"
              class="shrink-0 w-7 h-7 flex items-center justify-center rounded-md hover:bg-surface-2 transition-colors text-muted-foreground hover:text-foreground"
              (click)="copy(order().returnId!, 'returnId')"
              title="Copy Return ID"
            >
              <i [class]="copiedKey() === 'returnId' ? 'pi pi-check text-success' : 'pi pi-copy'" class="text-xs"></i>
            </button>
          </div>
        </div>
      }

      @if (order().invoiceId) {
        <div class="flex items-center justify-between gap-2 py-2">
          <span class="text-xs font-medium text-muted-foreground shrink-0">Invoice ID</span>
          <div class="flex items-center gap-2 min-w-0">
            <span class="text-xs font-mono text-primary truncate">{{ order().invoiceId }}</span>
            <button
              type="button"
              class="shrink-0 w-7 h-7 flex items-center justify-center rounded-md hover:bg-surface-2 transition-colors text-muted-foreground hover:text-foreground"
              (click)="copy(order().invoiceId!, 'invoiceId')"
              title="Copy Invoice ID"
            >
              <i [class]="copiedKey() === 'invoiceId' ? 'pi pi-check text-success' : 'pi pi-copy'" class="text-xs"></i>
            </button>
          </div>
        </div>
      }

    </div>
  `
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
