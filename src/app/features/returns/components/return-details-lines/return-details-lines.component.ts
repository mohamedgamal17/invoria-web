import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';

import type { ReturnLine } from '../../models/return.entity';
import { DEFAULT_CURRENCY_CODE } from '../../../../shared/models/currency';

@Component({
  selector: 'app-return-details-lines',
  standalone: true,
  imports: [CommonModule, CardModule, TableModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './return-details-lines.component.html'
})
export class ReturnDetailsLinesComponent {
  protected readonly currencyCode = signal(DEFAULT_CURRENCY_CODE);
  returnLines = input.required<ReturnLine[]>();
}
