import type { Payable } from '../models/payable.entity';

/**
 * Payable with the server-omitted party/source refs hydrated for display.
 * Resolved values win over the (currently absent) inline DTO refs; the
 * settlements array is copied defensively so store folds never alias it.
 */
export function hydratePayable(
  payable: Payable,
  partyName: string | null | undefined,
  purchaseNumber: string | null | undefined
): Payable {
  return {
    ...payable,
    party: partyName ? { id: payable.partyId, name: partyName } : (payable.party ?? null),
    source: purchaseNumber
      ? { id: payable.sourceId, purchaseNumber }
      : (payable.source ?? null),
    settlements: [...(payable.settlements ?? [])]
  };
}
