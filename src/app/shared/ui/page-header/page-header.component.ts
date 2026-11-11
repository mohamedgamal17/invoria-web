import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  templateUrl: './page-header.component.html',
})
export class PageHeaderComponent {
  title = input.required<string>();
  description = input.required<string>();
  eyebrow = input('Operations');
  eyebrowIcon = input('');
}
