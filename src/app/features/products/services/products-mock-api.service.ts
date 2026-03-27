import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';

import type {
  Product,
  ProductCreateInput,
  ProductUpdateInput
} from '../models/product';

function createAuditSnapshot(seed: number): {
  createdAt: string;
  createdBy: string;
  lastModifiedAt: string;
  lastModifiedBy: string;
} {
  // Deterministic-ish timestamps (no need for crypto accuracy here).
  const base = new Date('2026-03-18T22:28:04.665Z').getTime();
  const createdAt = new Date(base + seed * 60_000).toISOString();
  const lastModifiedAt = new Date(base + seed * 60_000 + 30_000).toISOString();
  return {
    createdAt,
    createdBy: 'string',
    lastModifiedAt,
    lastModifiedBy: 'string'
  };
}

function generateId(seed: number): string {
  return `prd_${seed.toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

type ListProductsResponse = {
  items: Product[];
  total: number;
};

const INITIAL_PRODUCTS: Product[] = Array.from({ length: 57 }, (_, i) => {
  const n = i + 1;
  const name = `Product ${n}`;
  const code = `PRD-${n.toString().padStart(4, '0')}`;
  const price = Math.round((10 + n * 2.75) * 100) / 100;
  const audit = createAuditSnapshot(n);

  return {
    id: generateId(n),
    name,
    code,
    price,
    ...audit
  };
});

let productsStore: Product[] = [...INITIAL_PRODUCTS];

@Injectable({
  providedIn: 'root'
})
export class ProductsMockApiService {
  listProducts(
    pageIndex: number,
    pageSize: number
  ): Observable<ListProductsResponse> {
    if (pageIndex < 0) return throwError(() => new Error('Invalid page index.'));
    if (pageSize <= 0) return throwError(() => new Error('Invalid page size.'));

    const start = pageIndex * pageSize;
    const items = productsStore.slice(start, start + pageSize);

    // Simulated network latency.
    return of({ items, total: productsStore.length }).pipe(delay(250));
  }

  createProduct(input: ProductCreateInput): Observable<Product> {
    try {
      this.assertCreateOrUpdateInput(input);
    } catch (err) {
      return throwError(() => err);
    }

    const nowSeed = productsStore.length + 1;
    const created = {
      id: generateId(nowSeed),
      ...input,
      ...createAuditSnapshot(nowSeed)
    } satisfies Product;

    productsStore = [created, ...productsStore];
    return of(created).pipe(delay(300));
  }

  updateProduct(
    id: string,
    input: ProductUpdateInput
  ): Observable<Product> {
    try {
      this.assertCreateOrUpdateInput(input);
    } catch (err) {
      return throwError(() => err);
    }

    const idx = productsStore.findIndex((p) => p.id === id);
    if (idx === -1) return throwError(() => new Error('Product not found.'));

    const nowSeed = idx + productsStore.length + 1;
    const audit = {
      lastModifiedAt: createAuditSnapshot(nowSeed).lastModifiedAt,
      lastModifiedBy: createAuditSnapshot(nowSeed).lastModifiedBy
    };

    const updated: Product = {
      ...productsStore[idx],
      ...input,
      ...audit
    };

    productsStore = [
      ...productsStore.slice(0, idx),
      updated,
      ...productsStore.slice(idx + 1)
    ];

    return of(updated).pipe(delay(300));
  }

  deleteProduct(id: string): Observable<void> {
    const idx = productsStore.findIndex((p) => p.id === id);
    if (idx === -1) return throwError(() => new Error('Product not found.'));

    productsStore = [
      ...productsStore.slice(0, idx),
      ...productsStore.slice(idx + 1)
    ];

    return of(undefined).pipe(delay(200));
  }

  searchProducts(query: string): Observable<Product[]> {
    const normalizedQuery = (query || '').toLowerCase().trim();

    // If query is empty, return top 20 products to show in "Show all" dropdown
    if (!normalizedQuery) {
      return of(productsStore.slice(0, 20)).pipe(delay(50));
    }

    const results = productsStore.filter(p =>
      p.name.toLowerCase().includes(normalizedQuery) ||
      p.code.toLowerCase().includes(normalizedQuery)
    ).slice(0, 20);

    return of(results).pipe(delay(50));
  }

  private assertCreateOrUpdateInput(input: ProductCreateInput): void {
    const name = (input.name || '').trim();
    const code = (input.code || '').trim();
    const price = input.price;

    if (!name) throw new Error('Name is required.');
    if (!code) throw new Error('Code is required.');
    if (!Number.isFinite(price) || price < 0) {
      throw new Error('Price must be a valid non-negative number.');
    }

    // Deterministic “failure” triggers for UI error handling demo/testing.
    if (name.toLowerCase().includes('error') || code.toUpperCase() === 'ERR') {
      throw new Error('Mock API validation failed for this product.');
    }
  }
}

