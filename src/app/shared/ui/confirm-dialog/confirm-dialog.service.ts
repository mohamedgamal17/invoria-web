import { Injectable, inject } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { Observable } from 'rxjs';

export type ConfirmDialogSeverity =
  | 'success'
  | 'info'
  | 'warn'
  | 'danger'
  | 'help'
  | 'primary'
  | 'secondary'
  | 'contrast';

/** Options for a shared confirmation dialog. */
export interface ConfirmDialogOptions {
  /** Dialog title, e.g. 'Delete Product'. */
  header: string;
  /** Dialog body question, e.g. 'Are you sure you want to delete "X"?'. */
  message: string;
  /** Severity of the accept button; omit for the default (primary) look. */
  severity?: ConfirmDialogSeverity;
  /** Accept button label; defaults to 'Confirm'. */
  acceptLabel?: string;
  /** Reject button label; defaults to 'Cancel'. */
  rejectLabel?: string;
  /** Warning icon; defaults to `pi pi-exclamation-triangle`. */
  icon?: string;
}

const DEFAULT_CONFIRM_ICON = 'pi pi-exclamation-triangle';
const DEFAULT_ACCEPT_LABEL = 'Confirm';
const DEFAULT_REJECT_LABEL = 'Cancel';

/**
 * App-wide confirmation dialog facade. Features confirm destructive or
 * state-changing actions through this service instead of each wiring
 * PrimeNG's `ConfirmationService`, `<p-confirmDialog>` markup and accept/
 * reject button styling themselves — one root-provided service plus the
 * single `<app-confirm-dialog>` host in `app.html` serve every route.
 *
 * `confirm()` resolves `true` when the user accepts and `false` when the
 * dialog is rejected or dismissed (Cancel button, close icon, Escape).
 */
@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly confirmationService = inject(ConfirmationService);
  private settlePendingResult?: (accepted: boolean) => void;

  confirm(options: ConfirmDialogOptions): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      let settled = false;
      const settleResult = (accepted: boolean): void => {
        if (settled) {
          return;
        }
        settled = true;
        this.settlePendingResult = undefined;
        observer.next(accepted);
        observer.complete();
      };

      this.settlePendingResult = settleResult;

      this.confirmationService.confirm({
        header: options.header,
        message: options.message,
        icon: options.icon ?? DEFAULT_CONFIRM_ICON,
        acceptButtonProps: {
          label: options.acceptLabel ?? DEFAULT_ACCEPT_LABEL,
          ...(options.severity ? { severity: options.severity } : {}),
        },
        rejectButtonProps: {
          label: options.rejectLabel ?? DEFAULT_REJECT_LABEL,
          severity: 'secondary',
          outlined: true,
        },
        accept: () => settleResult(true),
        reject: () => settleResult(false),
      });

      return () => {
        if (this.settlePendingResult === settleResult) {
          this.settlePendingResult = undefined;
        }
      };
    });
  }

  /** Called by `ConfirmDialogComponent` when the dialog hides without accept/reject (Escape, close icon). */
  handleDialogHidden(): void {
    this.settlePendingResult?.(false);
  }
}
