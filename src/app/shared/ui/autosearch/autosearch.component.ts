import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import type { AutoCompleteSelectEvent } from 'primeng/types/autocomplete';

/**
 * Dumb entity search control: PrimeNG autocomplete input + removable selected
 * value button. No API calls — suggestions come from the parent via the
 * `suggestions` input and searches are delegated back through the `search`
 * output (the parent owns debounce + API + caching).
 */
@Component({
  selector: 'app-autosearch',
  standalone: true,
  imports: [FormsModule, AutoCompleteModule, ButtonModule],
  templateUrl: './autosearch.component.html'
})
export class AutosearchComponent<T> {
  /** Currently selected entity; two-way bindable. */
  selected = model<T | null>(null);

  /** Suggestion list provided by the parent page. */
  suggestions = input<T[]>([]);

  /** Unique form control name (the parent template form registers it). */
  controlName = input.required<string>();

  placeholder = input('');
  disabled = input(false);

  /** Entity display property, used for both `field` and `optionLabel`. */
  field = input('name');
  dataKey = input('id');

  /** Remove button appearance: 'pi pi-times'/'secondary' for products, 'pi pi-user-minus'/'danger' for customers. */
  removeIcon = input('pi pi-times');
  removeSeverity = input<'secondary' | 'danger'>('secondary');

  inputStyleClass = input('w-full rounded-lg border-border bg-surface transition-all text-sm');

  /** Fires with `{ query }` when the user types or opens the dropdown. */
  search = output<{ query: string }>();

  /** Fires with the selected entity when the user picks a suggestion. */
  select = output<T>();

  /** Fires when the user removes the selected value. */
  clear = output<void>();

  onSelectedChange(value: T | null): void {
    this.selected.set(value);
  }

  onSelect(event: AutoCompleteSelectEvent): void {
    const item = event.value as T;
    this.selected.set(item);
    this.select.emit(item);
  }
}
