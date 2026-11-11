import { Component } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-payable-header',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './payable-header.component.html',
})
export class PayableHeaderComponent {}
