import { Component, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-return-details-toolbar',
  standalone: true,
  imports: [ButtonModule],
  template: `
    <p-button
      icon="pi pi-arrow-left"
      label="Back to Returns"
      [text]="true"
      (onClick)="back.emit()"
    />
  `
})
export class ReturnDetailsToolbarComponent {
  back = output<void>();
}
