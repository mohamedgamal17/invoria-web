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
  templateUrl: './return-progress.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class ReturnProgressComponent {
  readonly status = input.required<ReturnStatus>();
  readonly showLabel = input(true);
  readonly returnStatusUserLabel = returnStatusUserLabel;

  readonly steps = computed(() => {
    const status = this.status();

    const isRejected = status === ReturnStatus.Rejected;

    const terminalStep: Step = isRejected
      ? { status: ReturnStatus.Rejected, label: 'Rejected', icon: 'pi pi-ban', severity: 'danger' }
      : { status: ReturnStatus.Completed, label: 'Completed', icon: 'pi pi-check-circle' };

    return [
      { status: ReturnStatus.Pending, label: 'Pending', icon: 'pi pi-clock' },
      { status: ReturnStatus.Approved, label: 'Approved', icon: 'pi pi-verified' },
      terminalStep,
    ];
  });

  readonly currentStepIndex = computed(() => {
    const status = this.status();
    const stepList = this.steps();

    if (status === ReturnStatus.Rejected) {
      return stepList.length - 1;
    }

    const idx = stepList.findIndex((st) => st.status === status);
    if (idx >= 0) return idx;
    return 0;
  });
}
