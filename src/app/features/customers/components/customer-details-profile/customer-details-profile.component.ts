import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

import type { Customer } from '../../models/customer.entity';

@Component({
  selector: 'app-customer-details-profile',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule],
  templateUrl: './customer-details-profile.component.html'
})
export class CustomerDetailsProfileComponent {
  readonly customer = input.required<Customer>();
  readonly edit = output<void>();
}
