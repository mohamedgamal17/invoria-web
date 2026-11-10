import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';

import { SupplierDetailsPurchaseOrdersTabComponent } from './supplier-details-purchase-orders-tab.component';
import { PurchaseState } from '../../../procurement/enums/purchase-state.enum';
import type { PurchaseOrder } from '../../../procurement/models/purchase-order.entity';
import type { PurchaseOrdersListFilters } from '../../../procurement/components/purchase-orders-filter-panel/purchase-orders-filter-panel.component';

describe('SupplierDetailsPurchaseOrdersTabComponent (presentational)', () => {
  let component: SupplierDetailsPurchaseOrdersTabComponent;
  let fixture: ComponentFixture<SupplierDetailsPurchaseOrdersTabComponent>;

  const mockPurchaseOrder: PurchaseOrder = {
    id: 'po_1',
    purchaseNumber: 'PO-1',
    supplierId: 'sup_1',
    state: PurchaseState.Draft,
    subTotal: 0,
    totalAmount: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [SupplierDetailsPurchaseOrdersTabComponent, NoopAnimationsModule],
      providers: [{ provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } }],
    }).compileComponents();

    fixture = TestBed.createComponent(SupplierDetailsPurchaseOrdersTabComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('purchaseNumber', 'PO-9');
    fixture.componentRef.setInput('statusFilter', 1);
    fixture.componentRef.setInput('purchaseOrders', [mockPurchaseOrder]);
    fixture.componentRef.setInput('paging', { length: 1, skip: 0, totalCount: 1 });
    fixture.componentRef.setInput('first', 0);
    fixture.componentRef.setInput('pageSize', 25);
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();
  });

  it('should render the page data from the owning store inputs', () => {
    expect(component.purchaseOrders()).toEqual([mockPurchaseOrder]);
    expect(component.paging().totalCount).toBe(1);
    expect(component.loading()).toBe(false);
  });

  it('should re-emit filter changes to the owning page', () => {
    const filtersChangeSpy = vi.fn();
    component.filtersChange.subscribe(filtersChangeSpy);

    const filters: PurchaseOrdersListFilters = { purchaseNumber: 'PO-2', status: 2 };
    component.onFiltersChange(filters);

    expect(filtersChangeSpy).toHaveBeenCalledWith(filters);
  });

  it('should re-emit page changes to the owning page', () => {
    const pageChangeSpy = vi.fn();
    component.pageChange.subscribe(pageChangeSpy);

    const event = { first: 50, rows: 50, page: 1, pageCount: 2, startIndex: 50 };
    component.onPageChange(event as never);

    expect(pageChangeSpy).toHaveBeenCalledWith(event);
  });

  it('should re-emit clearFilters to the owning page', () => {
    const clearFiltersSpy = vi.fn();
    component.clearFilters.subscribe(clearFiltersSpy);

    component.onClearFilters();

    expect(clearFiltersSpy).toHaveBeenCalled();
  });

  it('should emit view when a purchase order is opened', () => {
    const viewSpy = vi.fn();
    component.view.subscribe(viewSpy);

    component.goToDetails(mockPurchaseOrder);

    expect(viewSpy).toHaveBeenCalledWith(mockPurchaseOrder);
  });
});
