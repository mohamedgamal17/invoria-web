import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

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
      imports: [
        PurchaseOrderListComponent,
        CommonModule,
        TableModule,
        ButtonModule,
        TagModule,
        PaginatorModule,
        SkeletonModule,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display skeleton rows when loading is true', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('pageSize', 25);
    fixture.detectChanges();
    const skeletons = fixture.nativeElement.querySelectorAll('p-skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should show empty message when no rows', () => {
    fixture.componentRef.setInput('purchaseOrders', []);
    fixture.componentRef.setInput('totalRecords', 0);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No purchase orders found');
  });

  it('should render purchase order rows', () => {
    fixture.componentRef.setInput('purchaseOrders', mockRows);
    fixture.componentRef.setInput('totalRecords', 2);
    fixture.detectChanges();
    const body = fixture.nativeElement.querySelector('.p-datatable-tbody');
    expect(body.textContent).toContain('PO-001');
    expect(body.textContent).toContain('PO-002');
    expect(body.textContent).toContain('Supplier A');
  });

  it('should fall back to supplierId when supplier name is absent', () => {
    fixture.componentRef.setInput('purchaseOrders', [mockRows[1]]);
    fixture.componentRef.setInput('totalRecords', 1);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('sup_2');
  });

  it('should hide supplier column when showSupplierColumn is false', () => {
    fixture.componentRef.setInput('purchaseOrders', mockRows);
    fixture.componentRef.setInput('totalRecords', 2);
    fixture.componentRef.setInput('showSupplierColumn', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Supplier A');
    expect(fixture.nativeElement.textContent).toContain('PO-001');
  });

  it('should emit pageChange from table paginator', () => {
    const emitSpy = vi.spyOn(component.pageChange, 'emit');
    const table = fixture.debugElement.query(By.css('p-table'));
    expect(table).toBeTruthy();
    const pageEvent = { first: 25, rows: 25, page: 1, pageCount: 2 };
    table.triggerEventHandler('onPage', pageEvent);
    expect(emitSpy).toHaveBeenCalledWith(pageEvent);
  });

  it('should emit view when View button is clicked', () => {
    fixture.componentRef.setInput('purchaseOrders', [mockRows[0]]);
    fixture.componentRef.setInput('totalRecords', 1);
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.view, 'emit');
    const buttons = fixture.debugElement.queryAll(By.css('p-button'));
    const viewButton = buttons.find((b) => b.nativeElement.innerHTML.includes('pi-arrow-right'));
    expect(viewButton).toBeTruthy();
    viewButton!.triggerEventHandler('onClick', {});
    expect(emitSpy).toHaveBeenCalledWith(mockRows[0]);
  });

});
