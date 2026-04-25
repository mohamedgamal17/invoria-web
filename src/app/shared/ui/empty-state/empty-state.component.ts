import { Component, input } from '@angular/core';
@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="rounded-xl border border-dashed border-border bg-surface-2/30 p-12 text-center">
      <i [class]="icon() + ' text-4xl text-muted-foreground opacity-25 mb-3 block'"></i>
      <div class="text-base font-medium text-foreground">{{ title() }}</div>
      <p class="mb-4 text-sm text-muted-foreground">{{ description() }}</p>
      <ng-content />
    </div>
  `
})
export class EmptyStateComponent {
  icon = input('pi pi-inbox');
  title = input.required<string>();
  description = input.required<string>();
}
