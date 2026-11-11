import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-supplier-header',
  standalone: true,
  imports: [ButtonModule, PageHeaderComponent],
  templateUrl: './supplier-header.component.html',
})
export class SupplierHeaderComponent {
  title = input('Suppliers');
  description = input('Manage procurement suppliers, codes, and contact details.');
  eyebrow = input('Procurement');
  create = output<void>();
}
