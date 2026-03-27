import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { ProductHeaderComponent } from './product-header.component';

describe('ProductHeaderComponent', () => {
  let component: ProductHeaderComponent;
  let fixture: ComponentFixture<ProductHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductHeaderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title and description text', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain('Product Catalog');
    expect(compiled.querySelector('p')?.textContent).toContain('Manage your product inventory and pricing from a central dashboard.');
  });

  it('should emit create when button is clicked', () => {
    const createSpy = vi.spyOn(component.create, 'emit');
    const button = fixture.debugElement.query(By.css('p-button'));

    button.triggerEventHandler('onClick', {});

    expect(createSpy).toHaveBeenCalled();
  });
});
