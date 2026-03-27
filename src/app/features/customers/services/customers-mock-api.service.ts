import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';

import type {
  Customer,
  CustomerCreateInput,
  CustomerUpdateInput
} from '../models/customer';

function createAuditSnapshot(seed: number): {
  createdAt: string;
  createdBy: string;
  lastModifiedAt: string;
  lastModifiedBy: string;
} {
  const base = new Date('2026-03-21T03:19:37.975Z').getTime();
  const createdAt = new Date(base + seed * 60_000).toISOString();
  const lastModifiedAt = new Date(base + seed * 60_000 + 30_000).toISOString();
  return {
    createdAt,
    createdBy: 'admin',
    lastModifiedAt,
    lastModifiedBy: 'admin'
  };
}

function generateId(seed: number): string {
  return `cust_${seed.toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

type ListCustomersResponse = {
  items: Customer[];
  total: number;
};

const INITIAL_CUSTOMERS: Customer[] = [
  { id: generateId(1), name: 'Global Tech Solutions', ...createAuditSnapshot(1) },
  { id: generateId(2), name: 'Nexus Dynamics', ...createAuditSnapshot(2) },
  { id: generateId(3), name: 'Starlight Manufacturing', ...createAuditSnapshot(3) },
  { id: generateId(4), name: 'Blue Horizon Logistics', ...createAuditSnapshot(4) },
  { id: generateId(5), name: 'Evergreen Systems', ...createAuditSnapshot(5) },
  { id: generateId(6), name: 'Velocity Retail Group', ...createAuditSnapshot(6) },
  { id: generateId(7), name: 'Summit Financial Services', ...createAuditSnapshot(7) },
  { id: generateId(8), name: 'Apex Consulting Labs', ...createAuditSnapshot(8) },
  { id: generateId(9), name: 'Ironwood Trading Co.', ...createAuditSnapshot(9) },
  { id: generateId(10), name: 'Swift Delivery Corp', ...createAuditSnapshot(10) },
  { id: generateId(11), name: 'Terra Nova Energy', ...createAuditSnapshot(11) },
  { id: generateId(12), name: 'Quantum Software Inc', ...createAuditSnapshot(12) },
  { id: generateId(13), name: 'Orion Biotech', ...createAuditSnapshot(13) },
  { id: generateId(14), name: 'Unity Health Group', ...createAuditSnapshot(14) },
  { id: generateId(15), name: 'Dynamic Media Ads', ...createAuditSnapshot(15) }
];

let customersStore: Customer[] = [...INITIAL_CUSTOMERS];

@Injectable({
  providedIn: 'root'
})
export class CustomersMockApiService {
  listCustomers(
    pageIndex: number,
    pageSize: number
  ): Observable<ListCustomersResponse> {
    if (pageIndex < 0) return throwError(() => new Error('Invalid page index.'));
    if (pageSize <= 0) return throwError(() => new Error('Invalid page size.'));

    const start = pageIndex * pageSize;
    const items = customersStore.slice(start, start + pageSize);

    return of({ items, total: customersStore.length }).pipe(delay(250));
  }

  createCustomer(input: CustomerCreateInput): Observable<Customer> {
    try {
      this.assertCreateOrUpdateInput(input);
    } catch (err) {
      return throwError(() => err);
    }

    const nowSeed = customersStore.length + 1;
    const created = {
      id: generateId(nowSeed),
      ...input,
      ...createAuditSnapshot(nowSeed)
    } satisfies Customer;

    customersStore = [created, ...customersStore];
    return of(created).pipe(delay(300));
  }

  updateCustomer(
    id: string,
    input: CustomerUpdateInput
  ): Observable<Customer> {
    try {
      this.assertCreateOrUpdateInput(input);
    } catch (err) {
      return throwError(() => err);
    }

    const idx = customersStore.findIndex((c) => c.id === id);
    if (idx === -1) return throwError(() => new Error('Customer not found.'));

    const nowSeed = idx + customersStore.length + 1;
    const audit = {
      lastModifiedAt: createAuditSnapshot(nowSeed).lastModifiedAt,
      lastModifiedBy: createAuditSnapshot(nowSeed).lastModifiedBy
    };

    const updated: Customer = {
      ...customersStore[idx],
      ...input,
      ...audit
    };

    customersStore = [
      ...customersStore.slice(0, idx),
      updated,
      ...customersStore.slice(idx + 1)
    ];

    return of(updated).pipe(delay(300));
  }

  deleteCustomer(id: string): Observable<void> {
    const idx = customersStore.findIndex((c) => c.id === id);
    if (idx === -1) return throwError(() => new Error('Customer not found.'));

    customersStore = [
      ...customersStore.slice(0, idx),
      ...customersStore.slice(idx + 1)
    ];

    return of(undefined).pipe(delay(200));
  }

  searchCustomers(query: string): Observable<Customer[]> {
    const normalizedQuery = (query || '').toLowerCase().trim();
    
    // If query is empty, return top 20 customers to show in "Show all" dropdown
    if (!normalizedQuery) {
      return of(customersStore.slice(0, 20)).pipe(delay(200));
    }

    const results = customersStore.filter(c => 
      c.name.toLowerCase().includes(normalizedQuery)
    ).slice(0, 20);

    return of(results).pipe(delay(200));
  }

  private assertCreateOrUpdateInput(input: CustomerCreateInput): void {
    const name = (input.name || '').trim();

    if (!name) throw new Error('Name is required.');

    if (name.toLowerCase().includes('error')) {
      throw new Error('Mock API validation failed for this customer.');
    }
  }
}
