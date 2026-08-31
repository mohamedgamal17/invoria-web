import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReturnStatus, returnStatusUserLabel } from '../../models/return-status.enum';

type Step = {
  status: ReturnStatus;
  label: string;
  icon: string;
  severity?: 'danger';
};

@Component({
  selector: 'app-return-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center w-full">
      @for (step of steps(); track step.status; let idx = $index; let last = $last) {
        <div
          class="flex flex-col items-center gap-1.5 shrink-0"
          [class.opacity-100]="idx <= currentStepIndex()"
          [class.opacity-30]="idx > currentStepIndex()"
        >
          <div
            class="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold transition-all duration-500 shrink-0"
            [class.bg-primary]="idx < currentStepIndex()"
            [class.text-primary-foreground]="idx < currentStepIndex()"
            [class.bg-danger]="idx === currentStepIndex() && step.severity === 'danger'"
            [class.text-white]="idx === currentStepIndex() && step.severity === 'danger'"
            [class.ring-danger]="idx === currentStepIndex() && step.severity === 'danger'"
            [class.ring-2]="idx === currentStepIndex()"
            [class.ring-primary]="idx === currentStepIndex() && step.severity !== 'danger'"
            [class.animate-pulse]="idx === currentStepIndex()"
            [class.bg-surface]="idx === currentStepIndex() && step.severity !== 'danger'"
            [class.text-foreground]="idx === currentStepIndex() && step.severity !== 'danger'"
            [class.border]="idx === currentStepIndex() && step.severity !== 'danger'"
            [class.border-border]="idx === currentStepIndex() && step.severity !== 'danger'"
            [class.bg-surface-2]="idx > currentStepIndex()"
            [class.text-muted-foreground]="idx > currentStepIndex()"
            [class.border]="idx > currentStepIndex()"
            [class.border-border]="idx > currentStepIndex()"
          >
            @if (idx < currentStepIndex()) {
              <i class="pi pi-check text-sm"></i>
            } @else {
              <i class="{{ step.icon }} text-sm"></i>
            }
          </div>
          <span
            class="text-[11px] font-bold uppercase tracking-wider whitespace-nowrap"
            [class.text-primary]="idx <= currentStepIndex() && step.severity !== 'danger'"
            [class.text-danger]="idx === currentStepIndex() && step.severity === 'danger'"
            [class.text-muted-foreground]="idx > currentStepIndex()"
          >
            {{ step.label }}
          </span>
        </div>
        @if (!last) {
          <div
            class="h-1 flex-1 mx-2 rounded-full transition-all duration-500"
            [class.bg-primary]="idx < currentStepIndex()"
            [class.bg-border]="idx >= currentStepIndex()"
          ></div>
        }
      }
    </div>
    @if (showLabel()) {
      <div class="text-center mt-3">
        <span class="text-sm font-medium text-foreground">
          {{ returnStatusUserLabel(status()) }}
        </span>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ReturnProgressComponent {
  readonly status = input.required<ReturnStatus>();
  readonly showLabel = input(true);
  readonly returnStatusUserLabel = returnStatusUserLabel;

  readonly steps = computed(() => {
    const s = this.status();

    const isRejected = s === ReturnStatus.Rejected;

    const terminalStep: Step = isRejected
      ? { status: ReturnStatus.Rejected, label: 'Rejected', icon: 'pi pi-ban', severity: 'danger' }
      : { status: ReturnStatus.Completed, label: 'Completed', icon: 'pi pi-check-circle' };

    return [
      { status: ReturnStatus.Pending, label: 'Pending', icon: 'pi pi-clock' },
      { status: ReturnStatus.Approved, label: 'Approved', icon: 'pi pi-verified' },
      terminalStep
    ];
  });

  readonly currentStepIndex = computed(() => {
    const s = this.status();
    const stepList = this.steps();

    if (s === ReturnStatus.Rejected) {
      return stepList.length - 1;
    }

    const idx = stepList.findIndex((st) => st.status === s);
    if (idx >= 0) return idx;
    return 0;
  });
}
