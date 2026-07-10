import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';

import type { ReturnLine } from '../../models/return.entity';

@Component({
  selector: 'app-return-details-lines',
  standalone: true,
  imports: [CommonModule, CardModule, TableModule],
  templateUrl: './return-details-lines.component.html'
})
export class ReturnDetailsLinesComponent {
  returnLines = input.required<ReturnLine[]>();
}
