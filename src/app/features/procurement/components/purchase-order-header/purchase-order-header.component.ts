import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-purchase-order-header',
  standalone: true,
  imports: [ButtonModule, PageHeaderComponent],
  templateUrl: './purchase-order-header.component.html',
})
export class PurchaseOrderHeaderComponent {
  title = input('Purchase orders');
  description = input('Review supplier purchase orders, amounts, and workflow state.');
  /** Hide until a create route exists. */
  showCreate = input(false);
  create = output<void>();
}
