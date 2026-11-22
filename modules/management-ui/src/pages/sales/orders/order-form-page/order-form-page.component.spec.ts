import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { provideStore, provideState } from '@ngrx/store';

import {
  ORDERS_LIST_FEATURE_KEY,
  ordersListReducer,
} from '@invoria/sales/orders/store/orders-list/orders-list.reducer';

import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

import { OrderFormPageComponent } from './order-form-page.component';
import { OrdersApiService } from '@invoria/sales/orders/services/orders-api.service';
import { CustomersApiService } from '@invoria/customers';
import { ProductsApiService } from '@invoria/catalog';
import type { Order } from '@invoria/sales/orders/models/order.entity';
import { OrderStatus } from '@invoria/sales/orders/models/order.entity';
import type { Product } from '@invoria/catalog';
import { PaymentStatus, PaymentType } from '@invoria/sales/orders/models/order-payment.enums';

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

  const product: Product = {
    id: 'p1',
    name: 'Widget',
    price: 10,
    stock: { actualQuantity: 0, reservedQuantity: 0 },
    createdAt: ''
  };

  const loadedOrder: Order = {
    id: 'ord_edit',
    createdAt: '2026-04-01T12:00:00.000Z',
    createdBy: 'u',
    lastModifiedAt: '2026-04-01T12:00:00.000Z',
    lastModifiedBy: 'u',
    orderNumber: 'ORD-E',
    customerId: 'c1',
    customer: { id: 'c1', name: 'Alice', createdAt: '2026-01-01T00:00:00.000Z' },
    status: OrderStatus.Pending,
    paymentType: PaymentType.Immediate,
    paymentStatus: PaymentStatus.Paid,
    amountPaid: 10,
    amountOutstanding: 0,
    returnItems: [],
    subtotalAmount: 10,
    netOrderAmount: 10,
    returnsAmount: 0,
    amountDue: 0,
    payments: [],
    orderAllocated: false,
    items: [{ id: 'line-1', productId: 'p1', quantity: 2, price: 5, product }]
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
        provideStore({}),
        provideState(ORDERS_LIST_FEATURE_KEY, ordersListReducer),
        {
          provide: OrdersApiService,
          useValue: {
            createOrder,
            getOrder,
            updateOrderItems,
            acceptOrder: vi.fn(),
            requestRevisionOrder: vi.fn(),
            completeOrder: vi.fn(),
            cancelOrder: vi.fn(),
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

  it('reuses cached products when the same query is searched again', async () => {
    vi.useFakeTimers();
    const widget = {
      id: 'p1',
      name: 'Widget',
      price: 10,
      stock: { actualQuantity: 0, reservedQuantity: 0 },
      createdAt: ''
    };
    searchProducts.mockImplementation((_: unknown, query: string) =>
      of(query === 'ab' ? [widget] : [])
    );

    component.searchProducts({ query: 'ab' });
    await vi.advanceTimersByTimeAsync(700);
    expect(searchProducts).toHaveBeenCalledTimes(1);
    expect(component.products()).toEqual([widget]);

    component.searchProducts({ query: 'ab' });
    await vi.advanceTimersByTimeAsync(700);
    expect(searchProducts).toHaveBeenCalledTimes(1);
    expect(component.products()).toEqual([widget]);
  });

  it('create mode does not load order by id', () => {
    expect(getOrder).not.toHaveBeenCalled();
  });

  it('submit warns when the payload has no customer id in create mode', () => {
    component.submit({
      customerId: '  ',
      paymentType: PaymentType.Immediate,
      items: [{ id: 'line-1', productId: 'p1', quantity: 1, price: 10, product }]
    });
    expect(messageAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'warn',
        summary: 'Customer required'
      })
    );
    expect(createOrder).not.toHaveBeenCalled();
  });

  it('submit creates order and navigates to detail', () => {
    component.submit({
      customerId: 'c1',
      paymentType: PaymentType.Immediate,
      items: [{ id: 'line-1', productId: 'p1', quantity: 1, price: 10, product }]
    });
    expect(createOrder).toHaveBeenCalledWith(
      expect.objectContaining({ customerId: 'c1', paymentType: PaymentType.Immediate })
    );
    expect(navigate).toHaveBeenCalledWith(['../', 'ord_new'], expect.anything());
  });

  it('onItemsChange keeps the displayed total in sync with the form lines', () => {
    component.onItemsChange([
      { id: 'line-1', productId: 'p1', quantity: 2, price: 10, product },
      { id: 'line-2', productId: 'p2', quantity: 1, price: 5, product: { ...product, id: 'p2' } }
    ]);
    expect(component.totalAmount()).toBe(25);
  });

  it('edit mode loads order on init', async () => {
    await setup({ mode: 'edit', id: 'ord_edit' });
    expect(getOrder).toHaveBeenCalledWith('ord_edit');
    expect(component.orderNumber()).toBe('ORD-E');
  });
});
