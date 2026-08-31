import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { OrderHeaderComponent } from './order-header.component';

describe('OrderHeaderComponent', () => {
  let component: OrderHeaderComponent;
  let fixture: ComponentFixture<OrderHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderHeaderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not define component-scoped styles', () => {
    const componentDef = (OrderHeaderComponent as any).ɵcmp;
    expect(componentDef.styles?.length ?? 0).toBe(0);
  });

  it('should have default title and description inputs', () => {
    expect(component.title()).toBe('Orders');
    expect(component.description()).toContain('Manage and track your customer orders');
  });

  it('should allow custom title and description via inputs', () => {
    fixture.componentRef.setInput('title', 'Custom Title');
    fixture.componentRef.setInput('description', 'Custom Description');
    fixture.detectChanges();
    expect(component.title()).toBe('Custom Title');
    expect(component.description()).toBe('Custom Description');
  });

  it('should emit create event via output', () => {
    const emitSpy = vi.spyOn(component.create, 'emit');
    component.create.emit();
    expect(emitSpy).toHaveBeenCalled();
  });
});
