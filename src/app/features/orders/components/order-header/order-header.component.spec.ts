import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { OrderHeaderComponent } from './order-header.component';
import { ButtonModule } from 'primeng/button';
import { By } from '@angular/platform-browser';

describe('OrderHeaderComponent', () => {
  let component: OrderHeaderComponent;
  let fixture: ComponentFixture<OrderHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderHeaderComponent, ButtonModule]
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

  it('should display default title and description', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Orders');
    expect(compiled.querySelector('.text-muted-foreground')?.textContent).toContain(
      'Manage and track your customer orders and status updates.'
    );
  });

  it('should display custom title and description', () => {
    fixture.componentRef.setInput('title', 'Custom Title');
    fixture.componentRef.setInput('description', 'Custom Description');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Custom Title');
    expect(compiled.querySelector('.text-muted-foreground')?.textContent).toContain('Custom Description');
  });

  it('should emit create event when button is clicked', () => {
    const emitSpy = vi.spyOn(component.create, 'emit');
    const button = fixture.debugElement.query(By.css('p-button'));
    button.triggerEventHandler('onClick', {});
    
    expect(emitSpy).toHaveBeenCalled();
  });
});
