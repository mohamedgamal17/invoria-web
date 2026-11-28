import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Mail, Info } from 'lucide-angular';
import { IvLabelComponent } from './index';

@Component({
  standalone: true,
  imports: [IvLabelComponent],
  template: `
    <iv-label htmlFor="projected-input" [required]="true">
      <span data-testid="projected-text">Projected Label</span>
    </iv-label>
  `,
})
class TestHostComponent {}

describe('IvLabelComponent', () => {
  let fixture: ComponentFixture<IvLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IvLabelComponent, TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IvLabelComponent);
  });

  it('renders text input and default md size class', () => {
    fixture.componentRef.setInput('text', 'Email Address');
    fixture.detectChanges();

    const label = (fixture.nativeElement as HTMLElement).querySelector('label');
    expect(label).not.toBeNull();
    expect(label?.textContent).toContain('Email Address');
    expect(label?.classList.contains('iv-label--md')).toBe(true);
    expect(label?.getAttribute('for')).toBeNull();
  });

  it('binds htmlFor, size, and styleClass inputs', () => {
    fixture.componentRef.setInput('text', 'Username');
    fixture.componentRef.setInput('htmlFor', 'username-input');
    fixture.componentRef.setInput('size', 'lg');
    fixture.componentRef.setInput('styleClass', 'custom-label');
    fixture.detectChanges();

    const label = (fixture.nativeElement as HTMLElement).querySelector('label');
    expect(label?.getAttribute('for')).toBe('username-input');
    expect(label?.classList.contains('iv-label--lg')).toBe(true);
    expect(label?.classList.contains('custom-label')).toBe(true);
  });

  it('renders required indicator when required is true', () => {
    fixture.componentRef.setInput('text', 'Password');
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();

    const label = (fixture.nativeElement as HTMLElement).querySelector('label');
    const asterisk = label?.querySelector('.iv-label__required');
    expect(label?.classList.contains('iv-label--required')).toBe(true);
    expect(asterisk).not.toBeNull();
    expect(asterisk?.textContent).toBe('*');
  });

  it('applies disabled class and aria-disabled when disabled is true', () => {
    fixture.componentRef.setInput('text', 'Disabled Field');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const label = (fixture.nativeElement as HTMLElement).querySelector('label');
    expect(label?.classList.contains('iv-label--disabled')).toBe(true);
    expect(label?.getAttribute('aria-disabled')).toBe('true');
  });

  it('renders lucide icon at start or end based on iconPos', () => {
    fixture.componentRef.setInput('text', 'Email');
    fixture.componentRef.setInput('icon', Mail);
    fixture.componentRef.setInput('iconPos', 'start');
    fixture.detectChanges();

    const label = (fixture.nativeElement as HTMLElement).querySelector('label');
    const firstElement = label?.firstElementChild;
    expect(firstElement?.tagName.toLowerCase()).toBe('lucide-icon');

    fixture.componentRef.setInput('icon', Info);
    fixture.componentRef.setInput('iconPos', 'end');
    fixture.detectChanges();

    const lastElement = label?.lastElementChild;
    expect(lastElement?.tagName.toLowerCase()).toBe('lucide-icon');
  });

  it('renders projected content via ng-content', () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();

    const projected = (hostFixture.nativeElement as HTMLElement).querySelector(
      '[data-testid="projected-text"]',
    );
    const label = (hostFixture.nativeElement as HTMLElement).querySelector('label');
    expect(projected?.textContent).toBe('Projected Label');
    expect(label?.getAttribute('for')).toBe('projected-input');
    expect(label?.querySelector('.iv-label__required')).not.toBeNull();
  });
});
