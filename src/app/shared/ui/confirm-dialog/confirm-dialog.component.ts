import { Component, inject } from '@angular/core';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { ConfirmDialogService } from './confirm-dialog.service';

/**
 * Single app-wide confirmation dialog host, rendered once in `app.html`.
 * It applies the app-standard confirm dialog defaults (explicit accept/
 * reject choice only — no Escape shortcut or close icon, focus starts on
 * the reject button) and lets `ConfirmDialogService` settle any pending
 * confirmation when the dialog hides without accept/reject.
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ConfirmDialogModule],
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  private readonly confirmDialogService = inject(ConfirmDialogService);

  onDialogHidden(): void {
    this.confirmDialogService.handleDialogHidden();
  }
}
