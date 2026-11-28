import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LoaderCircle, LucideAngularModule, type LucideIconData } from 'lucide-angular';
import {
  ICON_SIZES,
  type IvButtonAppearance,
  type IvButtonIconPosition,
  type IvButtonShape,
  type IvButtonSize,
  type IvButtonType,
  type IvButtonVariant,
} from './button.types';

/**
 * Custom Invoria button primitive (`iv-button`).
 * Supports `text` input or projected HTML via `<ng-content />`,
 * Lucide icons (`start`/`end`), loading state, and token-driven styling.
 */
@Component({
  selector: 'iv-button',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IvButtonComponent {
  size = input<IvButtonSize>('md');
  variant = input<IvButtonVariant>('primary');
  appearance = input<IvButtonAppearance>('solid');
  shape = input<IvButtonShape>('default');
  loading = input<boolean>(false);
  loadingText = input<string>('');
  icon = input<LucideIconData | null>(null);
  iconPosition = input<IvButtonIconPosition>('start');
  text = input<string>('');

  type = input<IvButtonType>('button');
  disabled = input<boolean>(false);
  fullWidth = input<boolean>(false);
  styleClass = input<string>('');
  ariaLabel = input<string>('');

  // eslint-disable-next-line @angular-eslint/no-output-native
  click = output<MouseEvent>();

  protected readonly loaderIcon = LoaderCircle;

  protected readonly isDisabled = computed(() => this.disabled() || this.loading());

  protected readonly iconSize = computed(() => ICON_SIZES[this.size()]);

  protected readonly buttonClasses = computed(() => {
    const classes = [
      'iv-btn',
      `iv-btn--${this.size()}`,
      `iv-btn--${this.variant()}`,
      `iv-btn--${this.appearance()}`,
      `iv-btn--shape-${this.shape()}`,
    ];

    if (this.fullWidth()) {
      classes.push('iv-btn--full');
    }
    if (this.loading()) {
      classes.push('iv-btn--loading');
    }
    const extraClass = this.styleClass().trim();
    if (extraClass) {
      classes.push(extraClass);
    }

    return classes.join(' ');
  });

  protected onButtonClick(event: MouseEvent): void {
    event.stopPropagation();
    if (this.isDisabled()) {
      event.preventDefault();
      return;
    }
    this.click.emit(event);
  }
}
