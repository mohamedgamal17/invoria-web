import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <div
      class="invoria-gradient-surface rounded-2xl border border-border/80 bg-surface px-4 py-4 shadow-sm sm:px-5"
    >
      <ng-content select="[slot=headerTop]" />
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="space-y-1">
          <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent/90">
            @if (eyebrowIcon(); as icon) {
              <i [class]="icon" class="mr-1.5"></i>
            }
            {{ eyebrow() }}
          </p>
          <h1 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {{ title() }}
          </h1>
          <p class="text-sm text-muted-foreground">{{ description() }}</p>
        </div>
        <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <ng-content />
        </div>
      </div>
    </div>
  `
})
export class PageHeaderComponent {
  title = input.required<string>();
  description = input.required<string>();
  eyebrow = input('Operations');
  eyebrowIcon = input('');
}
