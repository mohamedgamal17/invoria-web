import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { MessageService } from 'primeng/api';

import { CustomerDetailsPageComponent } from './customer-details-page.component';
import { CustomersApiService } from '../../services/customers-api.service';
import type { Customer } from '../../models/customer.entity';

function createActivatedRouteMock(
  initialParams: Record<string, string> = { id: 'cust_1' },
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

describe('CustomerDetailsPageComponent', () => {
  let fixture: ComponentFixture<CustomerDetailsPageComponent>;
  let component: CustomerDetailsPageComponent;
  let getCustomer: ReturnType<typeof vi.fn>;
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

  const customer: Customer = {
    id: 'cust_1',
    name: 'Acme Retail',
    createdAt: '2026-01-01T00:00:00.000Z'
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();

    getCustomer = vi.fn().mockReturnValue(
      of({
        isSuccess: true as const,
        result: customer
      })
    );

    const { paramMap$: pm, route } = createActivatedRouteMock();
    paramMap$ = pm;

    await TestBed.configureTestingModule({
      imports: [CustomerDetailsPageComponent, NoopAnimationsModule],
      providers: [
        MessageService,
        { provide: CustomersApiService, useValue: { getCustomer } },
        { provide: ActivatedRoute, useValue: route },
        { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerDetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load customer', () => {
    expect(getCustomer).toHaveBeenCalledWith('cust_1');
    expect(component.customer()?.id).toBe('cust_1');
  });

  it('backToList navigates to customers', () => {
    const router = TestBed.inject(Router);
    component.backToList();
    expect(router.navigate).toHaveBeenCalledWith(['/customers']);
  });

  it('onTabChange updates query param tab slug', () => {
    const router = TestBed.inject(Router);
    component.onTabChange(1);
    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: TestBed.inject(ActivatedRoute),
      replaceUrl: true,
      queryParams: { tab: 'orders' }
    });
  });

  it('reloads when route id param changes', () => {
    const customer2: Customer = { ...customer, id: 'cust_2', name: 'Beta Co' };
    getCustomer.mockImplementation((id: string) => {
      if (id === 'cust_1') {
        return of({ isSuccess: true as const, result: customer });
      }
      if (id === 'cust_2') {
        return of({ isSuccess: true as const, result: customer2 });
      }
      return of({ isSuccess: false as const, error: { message: 'Not found' } });
    });

    expect(component.customer()?.id).toBe('cust_1');

    paramMap$.next(convertToParamMap({ id: 'cust_2' }));
    fixture.detectChanges();

    expect(getCustomer).toHaveBeenCalledWith('cust_2');
    expect(component.customer()?.id).toBe('cust_2');
  });

  describe('unsuccessful getCustomer', () => {
    let addSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(async () => {
      TestBed.resetTestingModule();

      getCustomer = vi.fn().mockReturnValue(
        of({
          isSuccess: false as const,
          error: { message: 'Server error' }
        })
      );

      const { route } = createActivatedRouteMock({ id: 'cust_fail' }, {});

      await TestBed.configureTestingModule({
        imports: [CustomerDetailsPageComponent, NoopAnimationsModule],
        providers: [
          MessageService,
          { provide: CustomersApiService, useValue: { getCustomer } },
          { provide: ActivatedRoute, useValue: route },
          { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(CustomerDetailsPageComponent);
      component = fixture.componentInstance;
      addSpy = vi.spyOn(fixture.componentRef.injector.get(MessageService), 'add');
      fixture.detectChanges();
    });

    it('adds toast and clears customer', () => {
      expect(addSpy).toHaveBeenCalled();
      expect(component.customer()).toBeNull();
      expect(component.error()).toBeTruthy();
    });
  });
});
