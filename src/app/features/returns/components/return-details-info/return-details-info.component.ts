import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

import type { Return } from '../../models/return.entity';
import { returnTypeLabel } from '../../models/return-type.enum';
import { returnStatusUserLabel, returnStatusSeverity } from '../../models/return-status.enum';

@Component({
  selector: 'app-return-details-info',
  standalone: true,
  imports: [CommonModule, CardModule, TagModule],
  templateUrl: './return-details-info.component.html'
})
export class ReturnDetailsInfoComponent {
  return = input.required<Return>();

  protected readonly returnTypeLabel = returnTypeLabel;
  protected readonly returnStatusUserLabel = returnStatusUserLabel;
  protected readonly returnStatusSeverity = returnStatusSeverity;
}
