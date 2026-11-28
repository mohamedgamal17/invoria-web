import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import {
  IV_ICON_SIZES,
  type IvIcon,
  type IvIconPosition,
  type IvSize,
} from '../../common/common.types';

/**
 * Custom Invoria form label primitive (`iv-label`).
 * Supports `text` input or projected content via `<ng-content />`,
 * size scale (`xs`–`xl`), Lucide icons (`start`/`end`), `htmlFor`, `required`, and `disabled` states.
 */
@Component({
  selector: 'iv-label',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './label.component.html',
  styleUrl: './label.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IvLabelComponent {
  size = input<IvSize>('md');
  icon = input<IvIcon | null>(null);
  iconPos = input<IvIconPosition>('start');
  htmlFor = input<string | null>(null);
  required = input<boolean>(false);
  disabled = input<boolean>(false);
  text = input<string>('');
  styleClass = input<string>('');

  protected readonly iconSize = computed(() => IV_ICON_SIZES[this.size()]);

  protected readonly labelClasses = computed(() => {
    const classes = ['iv-label', `iv-label--${this.size()}`];

    if (this.required()) {
      classes.push('iv-label--required');
    }
    if (this.disabled()) {
      classes.push('iv-label--disabled');
    }
    const extraClass = this.styleClass().trim();
    if (extraClass) {
      classes.push(extraClass);
    }

    return classes.join(' ');
  });
}
