import { Component, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-product-details-toolbar',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './product-details-toolbar.component.html',
})
export class ProductDetailsToolbarComponent {
  readonly back = output<void>();
}
