import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { MessageService } from 'primeng/api';

import { SupplierDetailsPageComponent } from './supplier-details-page.component';
import { SuppliersApiService } from '../../services/suppliers-api.service';
import type { Supplier } from '../../models/supplier.entity';

function createActivatedRouteMock(
  initialParams: Record<string, string> = { id: 'sup_1' },
  initialQuery: Record<string, string> = {}
) {
  const paramMap$ = new BehaviorSubject(convertToParamMap(initialParams));
  const queryParamMap$ = new BehaviorSubject(convertToParamMap(initialQuery));
  return {
    paramMap$,
    queryParamMap$,
    route: {
      paramMap: paramMap$.asObservable(),
      queryParamMap: queryParamMap$.asObservable(),
      get snapshot() {
        return {
          paramMap: paramMap$.value,
          queryParamMap: queryParamMap$.value
        };
      }
    }
  };
}

describe('SupplierDetailsPageComponent', () => {
  let fixture: ComponentFixture<SupplierDetailsPageComponent>;
  let component: SupplierDetailsPageComponent;
  let getSupplier: ReturnType<typeof vi.fn>;
  let paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  beforeEach(() => {
    if (typeof globalThis.ResizeObserver === 'undefined') {
      globalThis.ResizeObserver = class {
        observe(): void {}
        unobserve(): void {}
        disconnect(): void {}
      };
    }
  });

  const supplier: Supplier = {
    id: 'sup_1',
    supplierCode: 'ACME',
    name: 'Acme',
    contactEmail: 'a@b.co',
    phone: '123',
    createdAt: '2026-01-01T00:00:00.000Z'
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();

    getSupplier = vi.fn().mockReturnValue(
      of({
        isSuccess: true as const,
        result: supplier
      })
    );

    const { paramMap$: pm, route } = createActivatedRouteMock();
    paramMap$ = pm;

    await TestBed.configureTestingModule({
      imports: [SupplierDetailsPageComponent, NoopAnimationsModule],
      providers: [
        MessageService,
        { provide: SuppliersApiService, useValue: { getSupplier } },
        { provide: ActivatedRoute, useValue: route },
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
    expect(router.navigate).toHaveBeenCalledWith(['/suppliers']);
  });

  it('onTabChange updates query param tab slug', () => {
    const router = TestBed.inject(Router);
    component.onTabChange(1);
    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: TestBed.inject(ActivatedRoute),
      replaceUrl: true,
      queryParams: { tab: 'purchase-orders' }
    });
  });

  it('reloads when route id param changes', () => {
    const supplier2: Supplier = { ...supplier, id: 'sup_2', name: 'Beta' };
    getSupplier.mockImplementation((id: string) => {
      if (id === 'sup_1') {
        return of({ isSuccess: true as const, result: supplier });
      }
      if (id === 'sup_2') {
        return of({ isSuccess: true as const, result: supplier2 });
      }
      return of({ isSuccess: false as const, error: { message: 'Not found' } });
    });

    expect(component.supplier()?.id).toBe('sup_1');

    paramMap$.next(convertToParamMap({ id: 'sup_2' }));
    fixture.detectChanges();

    expect(getSupplier).toHaveBeenCalledWith('sup_2');
    expect(component.supplier()?.id).toBe('sup_2');
  });

  describe('unsuccessful getSupplier', () => {
    let addSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(async () => {
      TestBed.resetTestingModule();

      getSupplier = vi.fn().mockReturnValue(
        of({
          isSuccess: false as const,
          error: { message: 'Server error' }
        })
      );

      const { route } = createActivatedRouteMock({ id: 'sup_fail' }, {});

      await TestBed.configureTestingModule({
        imports: [SupplierDetailsPageComponent, NoopAnimationsModule],
        providers: [
          MessageService,
          { provide: SuppliersApiService, useValue: { getSupplier } },
          { provide: ActivatedRoute, useValue: route },
          { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(SupplierDetailsPageComponent);
      component = fixture.componentInstance;
      addSpy = vi.spyOn(fixture.componentRef.injector.get(MessageService), 'add');
      fixture.detectChanges();
    });

    it('adds toast and clears supplier', () => {
      expect(addSpy).toHaveBeenCalled();
      expect(component.supplier()).toBeNull();
      expect(component.error()).toBeTruthy();
    });
  });
});
