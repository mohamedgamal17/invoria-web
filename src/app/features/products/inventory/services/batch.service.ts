import { Injectable } from '@angular/core';
import { delay, map, Observable, of, throwError } from 'rxjs';
import { Batch, BatchCreateInput, BatchPagedResponse, BatchState, BatchUpdateInput } from '../models/batch.model';

@Injectable({
  providedIn: 'root'
})
export class BatchService {
  private batches: Batch[] = [];

  constructor() {
    this.generateInitialBatches();
  }

  getBatches(productId: string, page: number, pageSize: number): Observable<BatchPagedResponse> {
    const filtered = this.batches.filter(b => b.productId === productId);
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    const total = filtered.length;

    return of({ items, total }).pipe(
      delay(this.getRandomDelay())
    );
  }

  createBatch(productId: string, dto: BatchCreateInput): Observable<Batch> {
    const newBatch: Batch = {
      id: `bat_${Math.random().toString(36).slice(2, 9)}`,
      productId,
      quantity: dto.quantity,
      reservedQuantity: 0,
      state: BatchState.Active,
      purchasePrice: dto.purchasePrice
    };

    this.batches = [newBatch, ...this.batches];
    return of(newBatch).pipe(
      delay(this.getRandomDelay())
    );
  }

  updateBatch(batchId: string, dto: BatchUpdateInput): Observable<Batch> {
    const index = this.batches.findIndex(b => b.id === batchId);
    if (index === -1) {
      return throwError(() => new Error('Batch not found'));
    }

    const updatedBatch = {
      ...this.batches[index],
      quantity: dto.quantity,
      purchasePrice: dto.purchasePrice
    };

    // Auto update state if quantity becomes 0
    if (updatedBatch.quantity === 0) {
      updatedBatch.state = BatchState.Depleted;
    } else if (this.batches[index].state === BatchState.Depleted && updatedBatch.quantity > 0) {
      updatedBatch.state = BatchState.Active;
    }

    this.batches = [
      ...this.batches.slice(0, index),
      updatedBatch,
      ...this.batches.slice(index + 1)
    ];

    return of(updatedBatch).pipe(
      delay(this.getRandomDelay())
    );
  }

  private getRandomDelay(): number {
    return Math.floor(Math.random() * (800 - 300 + 1)) + 300;
  }

  private generateInitialBatches(): void {
    // Generate some mock batches for initial products
    // We don't have access to productsStore here, so we'll just assume some exist 
    // or let it be empty until products are interacted with.
    // However, to make it look "populated", let's just generate for some IDs if we had them.
    // Since this is a mock service, we can just seed it with some data.
  }
}
