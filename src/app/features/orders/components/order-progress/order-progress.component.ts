import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderStatus } from '../../models/order.entity';
import { orderStatusUserLabel } from '../../models/order-actions';

type Step = {
  status: OrderStatus | 'allocation';
  label: string;
  icon: string;
  severity?: 'danger';
};

@Component({
  selector: 'app-order-progress',
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
            [class.animate-pulse]="idx === currentStepIndex() && step.status === 'allocation'"
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
          {{ orderStatusUserLabel(status()) }}
        </span>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class OrderProgressComponent {
  readonly status = input.required<OrderStatus>();
  readonly orderAllocated = input(false);
  readonly showLabel = input(true);
  readonly orderStatusUserLabel = orderStatusUserLabel;

  readonly steps = computed(() => {
    const s = this.status();
    const allocated = this.orderAllocated();

    const showAllocating = s === OrderStatus.Processing && !allocated;

    const lastStep: Step = s === OrderStatus.Cancelled
      ? { status: OrderStatus.Cancelled, label: 'Cancelled', icon: 'pi pi-ban', severity: 'danger' }
      : { status: OrderStatus.Completed, label: 'Completed', icon: 'pi pi-check-circle' };

    const steps: Step[] = [
      { status: OrderStatus.Pending, label: 'Pending', icon: 'pi pi-clock' },
      { status: OrderStatus.Processing, label: 'Processing', icon: 'pi pi-sync' },
      {
        status: 'allocation',
        label: showAllocating ? 'Allocating' : 'Allocated',
        icon: showAllocating ? 'pi pi-spinner pi-spin' : 'pi pi-verified'
      },
      lastStep
    ];

    if (s === OrderStatus.RevisionPending || s === OrderStatus.Revision) {
      steps.splice(1, 0, {
        status: s,
        label: 'Revision',
        icon: s === OrderStatus.RevisionPending ? 'pi pi-hourglass' : 'pi pi-pen-to-square'
      });
    }

    return steps;
  });

  readonly currentStepIndex = computed(() => {
    const s = this.status();
    const stepList = this.steps();

    if (s === OrderStatus.Processing) {
      const allocationIdx = stepList.findIndex((st) => st.status === 'allocation');
      return allocationIdx >= 0 ? allocationIdx : 0;
    }

    const idx = stepList.findIndex((st) => st.status === s);
    if (idx >= 0) return idx;

    return 0;
  });
}
