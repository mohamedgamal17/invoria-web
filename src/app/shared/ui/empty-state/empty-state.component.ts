import { Component, input } from '@angular/core';
@Component({
  selector: 'app-empty-state',
  standalone: true,
  templateUrl: './empty-state.component.html',
})
export class EmptyStateComponent {
  icon = input('pi pi-inbox');
  title = input.required<string>();
  description = input.required<string>();
}
