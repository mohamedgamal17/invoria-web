import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

import { CardModule } from 'primeng/card';
import { TimelineModule } from 'primeng/timeline';

import type { UiOrderStateHistoryEvent } from '../../models/order-ui.model';

@Component({
  selector: 'app-order-details-history-tab',
  standalone: true,
  imports: [CommonModule, CardModule, TimelineModule],
  templateUrl: './order-details-history-tab.component.html'
})
export class OrderDetailsHistoryTabComponent {
  readonly events = input.required<UiOrderStateHistoryEvent[]>();
}
