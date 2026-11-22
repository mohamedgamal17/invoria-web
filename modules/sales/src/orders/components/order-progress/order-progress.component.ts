import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { StatusStepsComponent } from '@invoria/ui';
import { OrderStatus } from '@invoria/sales/orders/models/order.entity';
import { getOrderStatusUserLabel } from '@invoria/sales/orders/models/order-actions';

type Step = {
  status: OrderStatus | 'allocation';
  label: string;
  icon: string;
  severity?: 'danger';
};

@Component({
  selector: 'app-order-progress',
  standalone: true,
  imports: [StatusStepsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-progress.component.html',
  host: {
    class: 'block',
  },
})
export class OrderProgressComponent {
  readonly status = input.required<OrderStatus>();
  readonly orderAllocated = input(false);
  readonly showLabel = input(true);
  readonly statusUserLabel = computed(() => getOrderStatusUserLabel(this.status()));

  readonly isAllocating = computed(
    () => this.status() === OrderStatus.Processing && !this.orderAllocated(),
  );

  readonly steps = computed(() => {
    const status = this.status();
    const allocated = this.orderAllocated();

    const showAllocating = status === OrderStatus.Processing && !allocated;

    const lastStep: Step =
      status === OrderStatus.Cancelled
        ? {
            status: OrderStatus.Cancelled,
            label: 'Cancelled',
            icon: 'pi pi-ban',
            severity: 'danger',
          }
        : { status: OrderStatus.Completed, label: 'Completed', icon: 'pi pi-check-circle' };

    const steps: Step[] = [
      { status: OrderStatus.Pending, label: 'Pending', icon: 'pi pi-clock' },
      { status: OrderStatus.Processing, label: 'Processing', icon: 'pi pi-sync' },
      {
        status: 'allocation',
        label: showAllocating ? 'Allocating' : 'Allocated',
        icon: showAllocating ? 'pi pi-spinner pi-spin' : 'pi pi-verified',
      },
      lastStep,
    ];

    if (status === OrderStatus.RevisionPending || status === OrderStatus.Revision) {
      steps.splice(1, 0, {
        status: status,
        label: 'Revision',
        icon: status === OrderStatus.RevisionPending ? 'pi pi-hourglass' : 'pi pi-pen-to-square',
      });
    }

    return steps;
  });

  readonly currentStepIndex = computed(() => {
    const status = this.status();
    const stepList = this.steps();

    if (status === OrderStatus.Processing) {
      const allocationIdx = stepList.findIndex((st) => st.status === 'allocation');
      return allocationIdx >= 0 ? allocationIdx : 0;
    }

    const idx = stepList.findIndex((st) => st.status === status);
    if (idx >= 0) return idx;

    return 0;
  });
}
