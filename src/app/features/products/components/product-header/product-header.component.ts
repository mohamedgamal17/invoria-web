import { Component, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-product-header',
  standalone: true,
  imports: [ButtonModule, PageHeaderComponent],
  templateUrl: './product-header.component.html',
})
export class ProductHeaderComponent {
  create = output<void>();
}
