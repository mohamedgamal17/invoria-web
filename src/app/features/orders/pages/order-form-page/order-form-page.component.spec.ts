import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';

import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

import { OrderFormPageComponent } from './order-form-page.component';
import { OrdersApiService } from '../../services/orders-api.service';
import { CustomersApiService } from '../../../customers/services/customers-api.service';
import { ProductsApiService } from '../../../products/services/products-api.service';
import type { Order } from '../../models/order.entity';
import { OrderFullfillmentStatus, OrderStatus } from '../../models/order.entity';

describe('OrderFormPageComponent', () => {
  let fixture: ComponentFixture<OrderFormPageComponent>;
  let component: OrderFormPageComponent;
  let createOrder: ReturnType<typeof vi.fn>;
  let getOrder: ReturnType<typeof vi.fn>;
  let updateOrderItems: ReturnType<typeof vi.fn>;
  let messageAdd: ReturnType<typeof vi.fn>;
  let navigate: ReturnType<typeof vi.fn>;
  let searchProducts: ReturnType<typeof vi.fn>;
  let searchCustomers: ReturnType<typeof vi.fn>;

  const loadedOrder: Order = {
    id: 'ord_edit',
    createdAt: '2026-04-01T12:00:00.000Z',
    createdBy: 'u',
    lastModifiedAt: '2026-04-01T12:00:00.000Z',
    lastModifiedBy: 'u',
    orderNumber: 'ORD-E',
    customerId: 'c1',
    customer: { id: 'c1', name: 'Alice', createdAt: '2026-01-01T00:00:00.000Z' },
    status: OrderStatus.Reopened,
    fullfillmentStatus: OrderFullfillmentStatus.Pending,
    items: [{ productId: 'p1', quantity: 2, price: 5 }]
  };

  async function setup(opts: { mode: 'create' | 'edit'; id?: string }) {
    TestBed.resetTestingModule();
    createOrder = vi.fn().mockReturnValue(
      of({
        isSuccess: true as const,
        result: { ...loadedOrder, id: 'ord_new' }
      })
    );
    getOrder = vi.fn().mockReturnValue(
      of({
        isSuccess: true as const,
        result: loadedOrder
      })
    );
    updateOrderItems = vi.fn().mockReturnValue(
      of({
        isSuccess: true as const,
        result: loadedOrder
      })
    );
    messageAdd = vi.fn();
    navigate = vi.fn().mockResolvedValue(true);
    searchProducts = vi.fn().mockReturnValue(of([]));
    searchCustomers = vi.fn().mockReturnValue(of([]));

    const snapshot =
      opts.mode === 'edit' && opts.id
        ? {
            data: { mode: 'edit' },
            paramMap: convertToParamMap({ id: opts.id })
          }
        : {
            data: {},
            paramMap: convertToParamMap({})
          };

    await TestBed.configureTestingModule({
      imports: [OrderFormPageComponent, NoopAnimationsModule],
      providers: [
        { provide: MessageService, useValue: { add: messageAdd } },
        {
          provide: OrdersApiService,
          useValue: {
            createOrder,
            getOrder,
            updateOrderItems,
            acceptOrder: vi.fn(),
            cancelOrder: vi.fn(),
            completeOrder: vi.fn(),
            dispatchOrder: vi.fn(),
            refuseOrder: vi.fn(),
            reopenOrder: vi.fn(),
            listOrders: vi.fn(),
            recordOrderPayment: vi.fn()
          }
        },
        {
          provide: CustomersApiService,
          useValue: { searchCustomers }
        },
        {
          provide: ProductsApiService,
          useValue: { searchProducts }
        },
        {
          provide: ActivatedRoute,
          useValue: { snapshot }
        },
        {
          provide: Router,
          useValue: { navigate }
        }
      ]
    })
      .overrideComponent(OrderFormPageComponent, {
        set: {
          template: '<section></section>',
          imports: [CommonModule, ButtonModule, CardModule]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(OrderFormPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    await setup({ mode: 'create' });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces searchProducts and passes last distinct query', async () => {
    vi.useFakeTimers();

    component.searchProducts({ query: 'a' });
    component.searchProducts({ query: 'ab' });
    expect(searchProducts).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(700);
    expect(searchProducts).toHaveBeenCalledTimes(1);
    expect(searchProducts).toHaveBeenCalledWith(expect.anything(), 'ab');
  });

  it('debounces searchCustomers and passes last distinct query', async () => {
    vi.useFakeTimers();

    component.searchCustomers({ query: 'x' });
    component.searchCustomers({ query: 'xy' });
    expect(searchCustomers).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(700);
    expect(searchCustomers).toHaveBeenCalledTimes(1);
    expect(searchCustomers).toHaveBeenCalledWith(expect.anything(), 'xy');
  });

  it('create mode does not load order by id', () => {
    expect(getOrder).not.toHaveBeenCalled();
  });

  it('submit warns when customer missing in create mode', () => {
    component.draftItems.set([
      { productId: 'p1', productName: 'P', quantity: 1, price: 10 }
    ]);
    component.submit();
    expect(messageAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'warn',
        summary: 'Customer required'
      })
    );
    expect(createOrder).not.toHaveBeenCalled();
  });

  it('submit warns when no line items', () => {
    component.selectedCustomer.set({
      id: 'c1',
      name: 'Alice',
      createdAt: '2026-01-01T00:00:00.000Z'
    });
    component.submit();
    expect(messageAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'warn',
        summary: 'Items required'
      })
    );
  });

  it('submit creates order and navigates to detail', () => {
    component.selectedCustomer.set({
      id: 'c1',
      name: 'Alice',
      createdAt: '2026-01-01T00:00:00.000Z'
    });
    component.draftItems.set([
      { productId: 'p1', productName: 'P', quantity: 1, price: 10 }
    ]);
    component.submit();
    expect(createOrder).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['../', 'ord_new'], expect.anything());
  });

  it('edit mode loads order on init', async () => {
    await setup({ mode: 'edit', id: 'ord_edit' });
    expect(getOrder).toHaveBeenCalledWith('ord_edit');
    expect(component.orderNumber()).toBe('ORD-E');
  });
});
