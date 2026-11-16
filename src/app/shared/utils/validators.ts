import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Tolerance for money comparisons, so amounts like 499.9995 still count as 500. */
export const MONEY_EPS = 0.005;

/** Inclusive amount bounds; `min === max` marks an exact-match (single allowed) amount. */
export interface AmountRange {
  min: number;
  max: number;
}

/**
 * Validator enforcing amount bounds on every value change:
 * `min === max` — must equal that amount within `MONEY_EPS` or fails with `amountMismatch`;
 * otherwise — must sit between min and max or fails with `min` / `max` errors.
 * A null or non-finite value passes here (pair with `Validators.required`), and a null
 * range disables the check.
 */
export function boundedAmountValidator(getRange: () => AmountRange | null): ValidatorFn {
  return (control: AbstractControl<number | null>): ValidationErrors | null => {
    const amount = control.value;
    if (amount === null || !Number.isFinite(amount)) {
      return null;
    }
    const range = getRange();
    if (range === null) {
      return null;
    }
    if (range.min === range.max) {
      return Math.abs(amount - range.min) > MONEY_EPS
        ? { amountMismatch: { expectedAmount: range.min } }
        : null;
    }
    if (amount < range.min) {
      return { min: { min: range.min, actual: amount } };
    }
    if (amount > range.max) {
      return { max: { max: range.max, actual: amount } };
    }
    return null;
  };
}
