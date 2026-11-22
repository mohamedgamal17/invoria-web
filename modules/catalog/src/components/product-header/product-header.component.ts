import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '@invoria/ui';

@Component({
  selector: 'app-product-header',
  standalone: true,
  imports: [ButtonModule, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-header.component.html',
})
export class ProductHeaderComponent {
  create = output<void>();
}
