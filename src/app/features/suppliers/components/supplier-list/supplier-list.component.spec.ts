import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';

import { SupplierListComponent } from './supplier-list.component';
import type { Supplier } from '../../models/supplier.entity';

describe('SupplierListComponent', () => {
  let fixture: ComponentFixture<SupplierListComponent>;
  let component: SupplierListComponent;

  const supplier: Supplier = {
    id: 's1',
    supplierCode: 'CODE',
    name: 'Test Supplier',
    createdAt: '2026-01-01T00:00:00.000Z'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SupplierListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('suppliers', [supplier]);
    fixture.componentRef.setInput('totalRecords', 1);
    fixture.componentRef.setInput('first', 0);
    fixture.componentRef.setInput('pageSize', 25);
    fixture.componentRef.setInput('isListLoading', false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit viewSupplier via output', () => {
    const spy = vi.fn();
    component.viewSupplier.subscribe(spy);
    component.viewSupplier.emit(supplier);
    expect(spy).toHaveBeenCalledWith(supplier);
  });

  it('should emit clearFilters via output', () => {
    const clearSpy = vi.spyOn(component.clearFilters, 'emit');
    component.clearFilters.emit();
    expect(clearSpy).toHaveBeenCalled();
  });
});
