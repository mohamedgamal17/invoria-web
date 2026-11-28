import {
  type AfterContentInit,
  afterEveryRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';
import type { IvFloatLabelVariant } from './float-label.types';

/**
 * Custom Invoria floating label container (`iv-float-label`).
 * Supports `in`, `on`, and `over` variants and works with both `<iv-label>` and native `<label>`.
 */
@Component({
  selector: 'iv-float-label',
  standalone: true,
  templateUrl: './float-label.component.html',
  styleUrl: './float-label.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(input)': 'syncFilledState()',
    '(change)': 'syncFilledState()',
  },
})
export class IvFloatLabelComponent implements AfterContentInit {
  private readonly hostElement: ElementRef<HTMLElement> = inject(ElementRef);

  variant = input<IvFloatLabelVariant>('over');
  styleClass = input<string>('');

  protected readonly isFilled = signal(false);

  protected readonly floatLabelClasses = computed(() => {
    const classes = ['iv-float-label', `iv-float-label--${this.variant()}`];

    if (this.isFilled()) {
      classes.push('iv-float-label--filled');
    }

    const extraClass = this.styleClass().trim();
    if (extraClass) {
      classes.push(extraClass);
    }

    return classes.join(' ');
  });

  constructor() {
    afterEveryRender(() => {
      this.syncFilledState();
    });
  }

  ngAfterContentInit(): void {
    this.syncFilledState();
  }

  protected syncFilledState(): void {
    const controls = this.hostElement.nativeElement.querySelectorAll<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >('input, textarea, select');

    let hasValue = false;
    controls.forEach((control) => {
      if (control.value.length > 0) {
        hasValue = true;
      }
    });

    if (this.isFilled() !== hasValue) {
      this.isFilled.set(hasValue);
    }
  }
}
