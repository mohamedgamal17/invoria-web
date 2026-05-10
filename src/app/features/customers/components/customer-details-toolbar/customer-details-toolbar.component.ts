import { Component, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-customer-details-toolbar',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './customer-details-toolbar.component.html'
})
export class CustomerDetailsToolbarComponent {
  readonly back = output<void>();
}
