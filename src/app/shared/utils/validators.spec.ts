import { describe, it, expect } from 'vitest';

import { FormControl } from '@angular/forms';

import { boundedAmountValidator, MONEY_EPS } from './validators';

describe('boundedAmountValidator', () => {
  it('passes an exact amount when min equals max', () => {
    const control = new FormControl<number | null>(500, boundedAmountValidator(() => ({ min: 500, max: 500 })));
    expect(control.hasError('amountMismatch')).toBe(false);
    expect(control.valid).toBe(true);
  });

  it('fails with amountMismatch when an exact amount is off by more than the money tolerance', () => {
    const control = new FormControl<number | null>(499.99, boundedAmountValidator(() => ({ min: 500, max: 500 })));
    expect(control.hasError('amountMismatch')).toBe(true);
    expect(control.getError('amountMismatch')).toEqual({ expectedAmount: 500 });
  });

  it('tolerates an exact amount within the money tolerance', () => {
    const control = new FormControl<number | null>(500 - MONEY_EPS / 2, boundedAmountValidator(() => ({ min: 500, max: 500 })));
    expect(control.valid).toBe(true);
  });

  it('passes an amount inside the allowed range', () => {
    const control = new FormControl<number | null>(150, boundedAmountValidator(() => ({ min: 100, max: 300 })));
    expect(control.valid).toBe(true);
  });

  it('fails with a min error below the range', () => {
    const control = new FormControl<number | null>(50, boundedAmountValidator(() => ({ min: 100, max: 300 })));
    expect(control.hasError('min')).toBe(true);
    expect(control.getError('min')).toEqual({ min: 100, actual: 50 });
  });

  it('fails with a max error above the range', () => {
    const control = new FormControl<number | null>(350, boundedAmountValidator(() => ({ min: 100, max: 300 })));
    expect(control.hasError('max')).toBe(true);
    expect(control.getError('max')).toEqual({ max: 300, actual: 350 });
  });

  it('passes a null value so the required validator can own emptiness', () => {
    const control = new FormControl<number | null>(null, boundedAmountValidator(() => ({ min: 100, max: 300 })));
    expect(control.valid).toBe(true);
  });

  it('passes a non-finite value so the required validator can own emptiness', () => {
    const control = new FormControl<number | null>(Number.NaN, boundedAmountValidator(() => ({ min: 100, max: 300 })));
    expect(control.valid).toBe(true);
  });

  it('passes any finite amount when the range is null', () => {
    const control = new FormControl<number | null>(7, boundedAmountValidator(() => null));
    expect(control.valid).toBe(true);
  });
});
