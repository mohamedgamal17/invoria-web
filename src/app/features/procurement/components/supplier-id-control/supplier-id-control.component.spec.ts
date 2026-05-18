import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

import { SupplierIdControlComponent } from './supplier-id-control.component';
import { SuppliersApiService } from '../../../suppliers/services/suppliers-api.service';

@Component({
  standalone: true,
  template: `
    <form [formGroup]="form">
      <app-supplier-id-control formControlName="supplierId" [resolvedSupplier]="resolved" />
    </form>
  `,
  imports: [ReactiveFormsModule, SupplierIdControlComponent]
})
class SupplierPickerHostComponent {
  readonly form = new FormBuilder().nonNullable.group({
    supplierId: ['']
  });
  resolved: { id: string; name: string } | null = null;
}

describe('SupplierIdControlComponent', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('should sync form control value from writeValue (CVA)', () => {
    const searchSuppliers = vi.fn().mockReturnValue(of([]));
    TestBed.configureTestingModule({
      imports: [SupplierIdControlComponent, NoopAnimationsModule],
      providers: [{ provide: SuppliersApiService, useValue: { searchSuppliers } }]
    });
    const fixture = TestBed.createComponent(SupplierIdControlComponent);
    const cmp = fixture.componentInstance;
    const onChange = vi.fn();
    cmp.registerOnChange(onChange);
    cmp.writeValue('sup_1');
    fixture.detectChanges();
    expect(cmp.selectedSupplier()?.id).toBe('sup_1');
    cmp.clearSelection();
    expect(onChange).toHaveBeenLastCalledWith('');
  });

  it('should bind to FormControl via formControlName', async () => {
    const searchSuppliers = vi.fn().mockReturnValue(of([]));
    await TestBed.configureTestingModule({
      imports: [SupplierPickerHostComponent, NoopAnimationsModule],
      providers: [{ provide: SuppliersApiService, useValue: { searchSuppliers } }]
    }).compileComponents();

    const fixture = TestBed.createComponent(SupplierPickerHostComponent);
    const host = fixture.componentInstance;
    host.resolved = { id: 'sup_1', name: 'Acme' };
    host.form.patchValue({ supplierId: 'sup_1' });
    fixture.detectChanges();
    await fixture.whenStable();

    const picker = fixture.debugElement.query(By.css('app-supplier-id-control'))
      .componentInstance as SupplierIdControlComponent;
    expect(picker.selectedSupplier()?.name).toBe('Acme');

    picker.clearSelection();
    expect(host.form.get('supplierId')?.value).toBe('');
  });

  it('does not duplicate API call when completeMethod fires twice with empty query', () => {
    const acme = { id: 'sup_1', name: 'Acme Supplies' };
    const searchSuppliers = vi.fn().mockReturnValue(of([acme]));
    TestBed.configureTestingModule({
      imports: [SupplierIdControlComponent, NoopAnimationsModule],
      providers: [{ provide: SuppliersApiService, useValue: { searchSuppliers } }]
    });
    const fixture = TestBed.createComponent(SupplierIdControlComponent);
    const cmp = fixture.componentInstance;

    cmp.onComplete({ query: '' });
    cmp.onComplete({ query: '' });
    expect(searchSuppliers).toHaveBeenCalledTimes(1);
    expect(cmp.suggestions()).toEqual([acme]);
  });

  it('applies cached first-page results immediately on second open without API call', () => {
    const acme = { id: 'sup_1', name: 'Acme Supplies' };
    const searchSuppliers = vi.fn().mockReturnValue(of([acme]));
    TestBed.configureTestingModule({
      imports: [SupplierIdControlComponent, NoopAnimationsModule],
      providers: [{ provide: SuppliersApiService, useValue: { searchSuppliers } }]
    });
    const fixture = TestBed.createComponent(SupplierIdControlComponent);
    const cmp = fixture.componentInstance;

    cmp.onComplete({ query: '' });
    expect(searchSuppliers).toHaveBeenCalledTimes(1);
    expect(cmp.suggestions()).toEqual([acme]);

    cmp.onComplete({ query: '' });
    expect(searchSuppliers).toHaveBeenCalledTimes(1);
    expect(cmp.suggestions()).toEqual([acme]);
  });

  it('reuses cached suppliers when the same query is searched again', () => {
    const acme = { id: 'sup_1', name: 'Acme Supplies' };
    const searchSuppliers = vi.fn().mockImplementation((_, query: string) =>
      of(query === 'ac' ? [acme] : [])
    );
    TestBed.configureTestingModule({
      imports: [SupplierIdControlComponent, NoopAnimationsModule],
      providers: [{ provide: SuppliersApiService, useValue: { searchSuppliers } }]
    });
    const fixture = TestBed.createComponent(SupplierIdControlComponent);
    const cmp = fixture.componentInstance;

    cmp.onComplete({ query: 'ac' });
    expect(searchSuppliers).toHaveBeenCalledTimes(1);
    expect(cmp.suggestions()).toEqual([acme]);

    cmp.onComplete({ query: 'xy' });
    expect(searchSuppliers).toHaveBeenCalledTimes(2);

    cmp.onComplete({ query: '  ac  ' });
    expect(searchSuppliers).toHaveBeenCalledTimes(2);
    expect(cmp.suggestions()).toEqual([acme]);
  });
});
