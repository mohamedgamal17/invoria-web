import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';

import { PurchaseOrderListComponent } from './purchase-order-list.component';
import type { PurchaseOrder } from '../../models/purchase-order.entity';
import { PurchaseState } from '../../enums/purchase-state.enum';

describe('PurchaseOrderListComponent', () => {
  let component: PurchaseOrderListComponent;
  let fixture: ComponentFixture<PurchaseOrderListComponent>;

  const mockRows: PurchaseOrder[] = [
    {
      id: '1',
      createdAt: '2026-01-01T00:00:00.000Z',
      lastModifiedAt: '2026-01-01T00:00:00.000Z',
      purchaseNumber: 'PO-001',
      supplierId: 'sup_1',
      supplier: { id: 'sup_1', name: 'Supplier A' },
      state: PurchaseState.Draft,
      orderDate: '2026-01-10T00:00:00.000Z',
      subTotal: 50,
      taxAmount: 7,
      discountAmount: 0,
      totalAmount: 57
    },
    {
      id: '2',
      createdAt: '2026-01-02T00:00:00.000Z',
      lastModifiedAt: '2026-01-02T00:00:00.000Z',
      purchaseNumber: 'PO-002',
      supplierId: 'sup_2',
      state: PurchaseState.Approved,
      orderDate: null,
      subTotal: 120,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: 120
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseOrderListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit pageChange via output', () => {
    const emitSpy = vi.spyOn(component.pageChange, 'emit');
    const pageEvent = { first: 25, rows: 25, page: 1, pageCount: 2 };
    component.pageChange.emit(pageEvent as any);
    expect(emitSpy).toHaveBeenCalledWith(pageEvent);
  });

  it('should emit view via output', () => {
    const emitSpy = vi.spyOn(component.view, 'emit');
    component.view.emit(mockRows[0]);
    expect(emitSpy).toHaveBeenCalledWith(mockRows[0]);
  });

  it('should expose purchaseOrders input', () => {
    fixture.componentRef.setInput('purchaseOrders', mockRows);
    fixture.componentRef.setInput('totalRecords', 2);
    fixture.detectChanges();
    expect(component.purchaseOrders()).toEqual(mockRows);
    expect(component.totalRecords()).toBe(2);
  });
});
