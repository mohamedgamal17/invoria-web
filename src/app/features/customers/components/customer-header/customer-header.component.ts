import { Component, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-customer-header',
  standalone: true,
  imports: [ButtonModule, PageHeaderComponent],
  templateUrl: './customer-header.component.html',
})
export class CustomerHeaderComponent {
  create = output<void>();
}
