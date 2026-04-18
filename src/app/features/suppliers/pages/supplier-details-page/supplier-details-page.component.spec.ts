import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';

import { MessageService } from 'primeng/api';

import { SupplierDetailsPageComponent } from './supplier-details-page.component';
import { SuppliersApiService } from '../../services/suppliers-api.service';
import type { Supplier } from '../../models/supplier.entity';

describe('SupplierDetailsPageComponent', () => {
  let fixture: ComponentFixture<SupplierDetailsPageComponent>;
  let component: SupplierDetailsPageComponent;
  let getSupplier: ReturnType<typeof vi.fn>;

  const supplier: Supplier = {
    id: 'sup_1',
    supplierCode: 'ACME',
    name: 'Acme',
    contactEmail: 'a@b.co',
    phone: '123',
    createdAt: '2026-01-01T00:00:00.000Z'
  };

  beforeEach(async () => {
    getSupplier = vi.fn().mockReturnValue(
      of({
        isSuccess: true as const,
        result: supplier
      })
    );

    await TestBed.configureTestingModule({
      imports: [SupplierDetailsPageComponent, NoopAnimationsModule],
      providers: [
        MessageService,
        { provide: SuppliersApiService, useValue: { getSupplier } },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: 'sup_1' }))
          }
        },
        { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SupplierDetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load supplier', () => {
    expect(getSupplier).toHaveBeenCalledWith('sup_1');
    expect(component.supplier()?.id).toBe('sup_1');
  });

  it('backToList navigates to suppliers', () => {
    const router = TestBed.inject(Router);
    component.backToList();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard', 'suppliers']);
  });
});
