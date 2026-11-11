import { Component } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-receivable-header',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './receivable-header.component.html',
})
export class ReceivableHeaderComponent {}
