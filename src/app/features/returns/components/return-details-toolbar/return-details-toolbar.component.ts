import { Component, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-return-details-toolbar',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './return-details-toolbar.component.html',
})
export class ReturnDetailsToolbarComponent {
  back = output<void>();
}
