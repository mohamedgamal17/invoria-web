import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { OrderListComponent } from './order-list.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { PopoverModule } from 'primeng/popover';
import { TimelineModule } from 'primeng/timeline';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import type { UiOrder } from '../../models/order-ui.model';
import { OrderFullfillmentStatus, OrderStatus } from '../../models/order.entity';

describe('OrderListComponent', () => {
  let component: OrderListComponent;
  let fixture: ComponentFixture<OrderListComponent>;

  const mockOrders: UiOrder[] = [
    {
      id: '1',
      orderNumber: 'ORD-001',
      customerName: 'Customer 1',
      totalAmount: 100,
      status: OrderStatus.Pending,
      fullfillmentStatus: OrderFullfillmentStatus.Pending,
      orderDate: new Date().toISOString(),
      items: [],
      stateHistory: [],
      failureDetails: [],
      createdAt: new Date().toISOString(),
      createdBy: 'system',
      lastModifiedAt: new Date().toISOString(),
      lastModifiedBy: 'system'
    },
    {
      id: '2',
      orderNumber: 'ORD-002',
      customerName: 'Customer 2',
      totalAmount: 200,
      status: OrderStatus.Accepted,
      fullfillmentStatus: OrderFullfillmentStatus.Allocated,
      orderDate: new Date().toISOString(),
      items: [],
      stateHistory: [],
      failureDetails: [],
      createdAt: new Date().toISOString(),
      createdBy: 'system',
      lastModifiedAt: new Date().toISOString(),
      lastModifiedBy: 'system'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        OrderListComponent,
        CommonModule,
        TableModule,
        ButtonModule,
        TagModule,
        TooltipModule,
        PaginatorModule,
        SkeletonModule,
        PopoverModule,
        TimelineModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not define component-scoped styles', () => {
    const componentDef = (OrderListComponent as any).ɵcmp;
    expect(componentDef.styles?.length ?? 0).toBe(0);
  });

  it('should display skeleton when loading is true', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const skeleton = fixture.nativeElement.querySelector('p-skeleton');
    expect(skeleton).toBeTruthy();
  });

  it('should display empty state when no orders', () => {
    fixture.componentRef.setInput('orders', []);
    fixture.detectChanges();
    const tableBody = fixture.nativeElement.querySelector('.p-datatable-tbody');
    expect(tableBody.textContent).toContain('No orders found');
  });

  it('should render orders in the table', () => {
    fixture.componentRef.setInput('orders', mockOrders);
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('.p-datatable-tbody tr');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('ORD-001');
    expect(rows[1].textContent).toContain('ORD-002');
  });

  it('should return correct status severity', () => {
    expect(component.getStatusSeverity('COMPLETED')).toBe('success');
    expect(component.getStatusSeverity('ACCEPTED')).toBe('info');
    expect(component.getStatusSeverity('REOPENED')).toBe('warn');
    expect(component.getStatusSeverity('PENDING')).toBe('secondary');
    expect(component.getStatusSeverity('CANCELLED')).toBe('danger');
    expect(component.getStatusSeverity('REFUSED')).toBe('danger');
    expect(component.getStatusSeverity('UNKNOWN')).toBe('secondary');
  });

  it('should hide fulfillment tag when order is cancelled', () => {
    const cancelled: UiOrder = {
      ...mockOrders[0],
      id: 'cancelled-1',
      status: OrderStatus.Cancelled,
      fullfillmentStatus: OrderFullfillmentStatus.Allocated
    };

    fixture.componentRef.setInput('orders', [cancelled]);
    fixture.detectChanges();

    const statusCell = fixture.nativeElement.querySelector(
      '.p-datatable-tbody tr td:nth-child(3)'
    ) as HTMLElement | null;
    expect(statusCell).toBeTruthy();

    const tags = statusCell!.querySelectorAll('p-tag');
    expect(tags.length).toBe(1);
    expect(statusCell!.textContent).toContain('CANCELLED');
  });

  it('should show fulfillment tag when order is not cancelled', () => {
    fixture.componentRef.setInput('orders', [mockOrders[1]]);
    fixture.detectChanges();

    const statusCell = fixture.nativeElement.querySelector(
      '.p-datatable-tbody tr td:nth-child(3)'
    ) as HTMLElement | null;
    expect(statusCell).toBeTruthy();

    const tags = statusCell!.querySelectorAll('p-tag');
    expect(tags.length).toBe(2);
  });

  it('should emit view when View Details is clicked', () => {
    fixture.componentRef.setInput('orders', [mockOrders[0]]);
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.view, 'emit');

    const buttons = fixture.debugElement.queryAll(By.css('p-button'));
    const viewButton = buttons.find((b) => b.nativeElement.innerHTML.includes('pi-arrow-right'));

    expect(viewButton).toBeTruthy();
    viewButton!.triggerEventHandler('onClick', {});
    expect(emitSpy).toHaveBeenCalledWith(mockOrders[0]);
  });

  it('should emit delete event when delete button is clicked', () => {
    fixture.componentRef.setInput('orders', [mockOrders[0]]);
    fixture.componentRef.setInput('showDelete', true);
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.delete, 'emit');
    
    const buttons = fixture.debugElement.queryAll(By.css('p-button'));
    const deleteButton = buttons.find(b => b.nativeElement.innerHTML.includes('pi-trash'));
    
    if (deleteButton) {
      deleteButton.triggerEventHandler('onClick', {});
      expect(emitSpy).toHaveBeenCalledWith(mockOrders[0]);
    } else {
      throw new Error('Delete button not found');
    }
  });

  it('should emit pageChange when paginator changes', () => {
    const emitSpy = vi.spyOn(component.pageChange, 'emit');
    const paginator = fixture.debugElement.query(By.css('p-paginator'));
    
    if (paginator) {
      const pageEvent = { first: 10, rows: 10, page: 1, pageCount: 5 };
      paginator.triggerEventHandler('onPageChange', pageEvent);
      expect(emitSpy).toHaveBeenCalledWith(pageEvent);
    }
  });
});
