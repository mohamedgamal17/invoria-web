import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-order-header',
  standalone: true,
  imports: [ButtonModule, PageHeaderComponent],
  templateUrl: './order-header.component.html',
})
export class OrderHeaderComponent {
  title = input('Orders');
  description = input('Manage and track your customer orders from creation to delivery.');
  create = output<void>();
}
