import { Component, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-supplier-details-toolbar',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './supplier-details-toolbar.component.html'
})
export class SupplierDetailsToolbarComponent {
  readonly back = output<void>();
}
