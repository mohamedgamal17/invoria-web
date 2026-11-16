import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-product-details-toolbar',
  standalone: true,
  imports: [ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-details-toolbar.component.html',
})
export class ProductDetailsToolbarComponent {
  readonly back = output<void>();
}
