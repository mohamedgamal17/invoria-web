import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

import { createDebouncedInput } from '@invoria/utils';
import { SurfaceCardComponent } from '../surface-card/surface-card.component';

export type NameListFilters = {
  name: string;
};

/**
 * Name-only filter panel shared by the customers, suppliers and products lists.
 * The draft value is debounced before being emitted; clearing is delegated to
 * the parent so URL ownership stays with the page.
 */
@Component({
  selector: 'app-name-filter-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SurfaceCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './name-filter-panel.component.html',
})
export class NameFilterPanelComponent {
  name = input<string>('');
  loading = input(false);
  label = input('Name');
  inputId = input('name-filter');

  filtersChange = output<NameListFilters>();
  clearFilters = output<void>();

  private readonly debouncedName = createDebouncedInput(this.name, (nameValue: string) =>
    this.filtersChange.emit({ name: nameValue }),
  );

  readonly localName = this.debouncedName.value;

  onNameInput(value: string): void {
    this.debouncedName.set(value);
  }

  onClear(): void {
    this.clearFilters.emit();
  }
}
