import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ConfirmationService, type Confirmation } from 'primeng/api';

import { ConfirmDialogService } from './confirm-dialog.service';

describe('ConfirmDialogService', () => {
  let service: ConfirmDialogService;
  let confirmationService: ConfirmationService;
  let capturedConfirmation: Confirmation | undefined;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ConfirmationService] });
    service = TestBed.inject(ConfirmDialogService);
    confirmationService = TestBed.inject(ConfirmationService);

    capturedConfirmation = undefined;
    vi.spyOn(confirmationService, 'confirm').mockImplementation((confirmation) => {
      capturedConfirmation = confirmation;
      return confirmationService;
    });
  });

  it('applies app defaults and resolves true when accepted', () => {
    const results: boolean[] = [];
    service
      .confirm({ header: 'Delete Product', message: 'Sure?', severity: 'danger', acceptLabel: 'Delete' })
      .subscribe((accepted) => results.push(accepted));

    expect(confirmationService.confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        header: 'Delete Product',
        message: 'Sure?',
        icon: 'pi pi-exclamation-triangle',
        acceptButtonProps: { label: 'Delete', severity: 'danger' },
        rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      }),
    );

    capturedConfirmation?.accept?.();
    expect(results).toEqual([true]);
  });

  it('falls back to Confirm label and primary accept when severity omitted', () => {
    service.confirm({ header: 'Reopen', message: 'Reopen for changes?' }).subscribe();

    expect(confirmationService.confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        acceptButtonProps: { label: 'Confirm' },
      }),
    );
  });

  it('allows overriding the reject label', () => {
    service.confirm({ header: 'Reject', message: 'Reject this?', rejectLabel: 'Keep' }).subscribe();

    expect(confirmationService.confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        rejectButtonProps: { label: 'Keep', severity: 'secondary', outlined: true },
      }),
    );
  });

  it('resolves false when rejected', () => {
    const results: boolean[] = [];
    service.confirm({ header: 'Cancel order', message: 'Cancel?' }).subscribe((accepted) => results.push(accepted));

    capturedConfirmation?.reject?.();
    expect(results).toEqual([false]);
  });

  it('resolves false once when the dialog hides without a callback', () => {
    const results: boolean[] = [];
    service.confirm({ header: 'Cancel order', message: 'Cancel?' }).subscribe((accepted) => results.push(accepted));

    service.handleDialogHidden();
    service.handleDialogHidden();
    capturedConfirmation?.reject?.();
    expect(results).toEqual([false]);
  });

  it('clears the pending confirmation when the subscription is torn down', () => {
    const results: boolean[] = [];
    const subscription = service
      .confirm({ header: 'Cancel order', message: 'Cancel?' })
      .subscribe((accepted) => results.push(accepted));
    subscription.unsubscribe();

    service.handleDialogHidden();
    expect(results).toEqual([]);
  });

  it('supports sequential confirmations', () => {
    const results: boolean[] = [];
    service.confirm({ header: 'First', message: 'First?' }).subscribe((accepted) => results.push(accepted));
    capturedConfirmation?.accept?.();

    service.confirm({ header: 'Second', message: 'Second?' }).subscribe((accepted) => results.push(accepted));
    capturedConfirmation?.reject?.();

    expect(results).toEqual([true, false]);
  });
});
