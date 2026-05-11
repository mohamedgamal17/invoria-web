import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';

export type PurchaseOrderStateTimelineRow = {
  fromLabel: string;
  toLabel: string;
  severity:
    | 'success'
    | 'secondary'
    | 'info'
    | 'warn'
    | 'danger'
    | 'contrast'
    | undefined;
  changedAt: string;
  reason?: string | null;
};

@Component({
  selector: 'app-purchase-order-details-history-tab',
  standalone: true,
  imports: [CommonModule, CardModule, TagModule, TimelineModule],
  templateUrl: './purchase-order-details-history-tab.component.html'
})
export class PurchaseOrderDetailsHistoryTabComponent {
  @Input({ required: true }) events!: PurchaseOrderStateTimelineRow[];
}
