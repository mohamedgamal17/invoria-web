import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import type { Order, OrderCreateInput, OrderUpdateInput, OrderStatus } from '../models/order';

function createAuditSnapshot(seed: number): {
  createdAt: string;
  createdBy: string;
  lastModifiedAt: string;
  lastModifiedBy: string;
} {
  const base = new Date('2026-03-22T01:24:24.000Z').getTime();
  const createdAt = new Date(base - seed * 3600_000).toISOString();
  const lastModifiedAt = new Date(base - seed * 3600_000 + 120_000).toISOString();
  return {
    createdAt,
    createdBy: 'system',
    lastModifiedAt,
    lastModifiedBy: 'system'
  };
}

function generateId(seed: number): string {
  return `ord_${seed.toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

type ListOrdersResponse = {
  items: Order[];
  total: number;
};

const STATUS_OPTIONS: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const INITIAL_ORDERS: Order[] = Array.from({ length: 42 }, (_, i) => {
  const n = i + 1;
  const orderNumber = `ORD-${n.toString().padStart(5, '0')}`;
  const customerNames = ['Ahmad Ali', 'Sara Smith', 'David Muller', 'Elena Rossi', 'John Doe'];
  const customerName = customerNames[i % customerNames.length];
  const totalAmount = Math.round((50 + n * 12.5) * 100) / 100;
  const status = STATUS_OPTIONS[i % STATUS_OPTIONS.length];
  const audit = createAuditSnapshot(n);

  return {
    id: generateId(n),
    orderNumber,
    customerName,
    totalAmount,
    status,
    orderDate: audit.createdAt,
    ...audit
  };
});

let ordersStore: Order[] = [...INITIAL_ORDERS];

@Injectable({
  providedIn: 'root'
})
export class OrdersMockApiService {
  listOrders(
    pageIndex: number,
    pageSize: number
  ): Observable<ListOrdersResponse> {
    if (pageIndex < 0) return throwError(() => new Error('Invalid page index.'));
    if (pageSize <= 0) return throwError(() => new Error('Invalid page size.'));

    const start = pageIndex * pageSize;
    const items = ordersStore.slice(start, start + pageSize);

    return of({ items, total: ordersStore.length }).pipe(delay(250));
  }

  getOrderById(id: string): Observable<Order> {
    const order = ordersStore.find(o => o.id === id);
    if (!order) return throwError(() => new Error('Order not found.'));
    return of(order).pipe(delay(150));
  }

  createOrder(input: OrderCreateInput): Observable<Order> {
    const nowSeed = ordersStore.length + 1;
    const created = {
      id: generateId(nowSeed),
      ...input,
      ...createAuditSnapshot(nowSeed)
    } satisfies Order;

    ordersStore = [created, ...ordersStore];
    return of(created).pipe(delay(300));
  }

  updateOrder(id: string, input: OrderUpdateInput): Observable<Order> {
    const idx = ordersStore.findIndex(o => o.id === id);
    if (idx === -1) return throwError(() => new Error('Order not found.'));

    const updated = {
      ...ordersStore[idx],
      ...input,
      lastModifiedAt: new Date().toISOString(),
      lastModifiedBy: 'system'
    } as Order;

    ordersStore = [
      ...ordersStore.slice(0, idx),
      updated,
      ...ordersStore.slice(idx + 1)
    ];

    return of(updated).pipe(delay(300));
  }

  deleteOrder(id: string): Observable<void> {
    const idx = ordersStore.findIndex(o => o.id === id);
    if (idx === -1) return throwError(() => new Error('Order not found.'));

    ordersStore = ordersStore.filter(o => o.id !== id);
    return of(undefined).pipe(delay(200));
  }
}
