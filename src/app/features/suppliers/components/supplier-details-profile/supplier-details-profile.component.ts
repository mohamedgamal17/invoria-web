import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

import type { Supplier } from '../../models/supplier.entity';

@Component({
  selector: 'app-supplier-details-profile',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule],
  templateUrl: './supplier-details-profile.component.html'
})
export class SupplierDetailsProfileComponent {
  readonly supplier = input.required<Supplier>();
  readonly edit = output<void>();
}
