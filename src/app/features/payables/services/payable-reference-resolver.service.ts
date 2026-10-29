import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { catchError, map, of } from 'rxjs';

import { SuppliersApiService } from '../../suppliers/services/suppliers-api.service';
import { PurchaseOrdersApiService } from '../../procurement/services/purchase-orders-api.service';

/**
 * Client-side enrichment for payable `PartyId` / `SourceId` references.
 *
 * `PayableDto` wires only the raw reference ids (no inline `Party`
 * or `Source`), so supplier names and purchase order numbers are
 * resolved here and cached per session. Errors resolve to `null`
 * so enrichment never fails the underlying payables queries.
 */
@Injectable({
  providedIn: 'root'
})
export class PayableReferenceResolverService {
  private readonly suppliersApi = inject(SuppliersApiService);
  private readonly purchaseOrdersApi = inject(PurchaseOrdersApiService);

  private readonly partyNames = new Map<string, Promise<string | null>>();
  private readonly sourceNumbers = new Map<string, Promise<string | null>>();

  /** Supplier display name for a payable `partyId` (cached, never rejects). */
  getPartyName(partyId: string): Promise<string | null> {
    const key = partyId.trim();
    if (!key) {
      return Promise.resolve(null);
    }

    let cached = this.partyNames.get(key);
    if (!cached) {
      cached = firstValueFrom(
        this.suppliersApi.getSupplier(key).pipe(
          map((res) => (res.isSuccess && res.result ? res.result.name : null)),
          catchError(() => of(null))
        )
      );
      this.partyNames.set(key, cached);
    }
    return cached;
  }

  /** Purchase order number for a payable `sourceId` (cached, never rejects). */
  getPurchaseOrderNumber(sourceId: string): Promise<string | null> {
    const key = sourceId.trim();
    if (!key) {
      return Promise.resolve(null);
    }

    let cached = this.sourceNumbers.get(key);
    if (!cached) {
      cached = firstValueFrom(
        this.purchaseOrdersApi.getPurchaseOrder(key).pipe(
          map((res) => (res.isSuccess && res.result ? res.result.purchaseNumber : null)),
          catchError(() => of(null))
        )
      );
      this.sourceNumbers.set(key, cached);
    }
    return cached;
  }
}
