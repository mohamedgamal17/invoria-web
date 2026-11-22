import { describe, it, expect } from 'vitest';

import { PurchaseState } from '../enums/purchase-state.enum';
import { purchaseStateLabel, purchaseStateSeverity } from './purchase-state.display';

describe('purchaseStateLabel', () => {
  it('should map known states', () => {
    expect(purchaseStateLabel(PurchaseState.Draft)).toBe('Draft');
    expect(purchaseStateLabel(PurchaseState.Completed)).toBe('Completed');
    expect(purchaseStateLabel(PurchaseState.Rejected)).toBe('Rejected');
  });
});

describe('purchaseStateSeverity', () => {
  it('should map completed to success', () => {
    expect(purchaseStateSeverity(PurchaseState.Completed)).toBe('success');
  });

  it('should map rejected to danger', () => {
    expect(purchaseStateSeverity(PurchaseState.Rejected)).toBe('danger');
  });
});
