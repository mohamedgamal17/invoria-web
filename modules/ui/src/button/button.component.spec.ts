import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Plus } from 'lucide-angular';
import { IvButtonComponent } from './index';

@Component({
  standalone: true,
  imports: [IvButtonComponent],
  template: `
    <iv-button variant="secondary" appearance="outline" size="lg">
      <span data-testid="projected-label">Projected HTML</span>
    </iv-button>
  `,
})
class TestHostComponent {}

describe('IvButtonComponent', () => {
  let component: IvButtonComponent;
  let fixture: ComponentFixture<IvButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IvButtonComponent, TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IvButtonComponent);
    component = fixture.componentInstance;
  });

  it('renders text input and default variant/appearance/size classes', () => {
    fixture.componentRef.setInput('text', 'Save');
    fixture.detectChanges();

    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(button).not.toBeNull();
    expect(button?.textContent).toContain('Save');
    expect(button?.classList.contains('iv-btn--md')).toBe(true);
    expect(button?.classList.contains('iv-btn--primary')).toBe(true);
    expect(button?.classList.contains('iv-btn--solid')).toBe(true);
    expect(button?.classList.contains('iv-btn--shape-default')).toBe(true);
    expect(button?.getAttribute('type')).toBe('button');
  });

  it('applies size, variant, appearance, shape, fullWidth, and styleClass inputs', () => {
    fixture.componentRef.setInput('size', 'xl');
    fixture.componentRef.setInput('variant', 'secondary');
    fixture.componentRef.setInput('appearance', 'ghost');
    fixture.componentRef.setInput('shape', 'pill');
    fixture.componentRef.setInput('fullWidth', true);
    fixture.componentRef.setInput('styleClass', 'custom-hook');
    fixture.detectChanges();

    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(button?.classList.contains('iv-btn--xl')).toBe(true);
    expect(button?.classList.contains('iv-btn--secondary')).toBe(true);
    expect(button?.classList.contains('iv-btn--ghost')).toBe(true);
    expect(button?.classList.contains('iv-btn--shape-pill')).toBe(true);
    expect(button?.classList.contains('iv-btn--full')).toBe(true);
    expect(button?.classList.contains('custom-hook')).toBe(true);

    fixture.componentRef.setInput('shape', 'rounded');
    fixture.detectChanges();
    expect(button?.classList.contains('iv-btn--shape-rounded')).toBe(true);
  });

  it('emits click exactly once when enabled', () => {
    fixture.componentRef.setInput('text', 'Submit');
    fixture.detectChanges();

    let clickCount = 0;
    component.click.subscribe(() => {
      clickCount += 1;
    });

    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    button?.click();

    expect(clickCount).toBe(1);
  });

  it('disables button and suppresses click when disabled is true', () => {
    fixture.componentRef.setInput('text', 'Disabled');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    let clickCount = 0;
    component.click.subscribe(() => {
      clickCount += 1;
    });

    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(button?.disabled).toBe(true);
    button?.click();

    expect(clickCount).toBe(0);
  });

  it('shows spinner only without loadingText, sets aria-busy, disables button, and blocks click when loading is true', () => {
    fixture.componentRef.setInput('text', 'Saving');
    fixture.componentRef.setInput('icon', Plus);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    let clickCount = 0;
    component.click.subscribe(() => {
      clickCount += 1;
    });

    const element = fixture.nativeElement as HTMLElement;
    const button = element.querySelector('button');
    const spinner = element.querySelector('.iv-btn__spinner');
    const label = element.querySelector('.iv-btn__label');
    const regularIcon = element.querySelector('.iv-btn__icon');

    expect(button?.disabled).toBe(true);
    expect(button?.getAttribute('aria-busy')).toBe('true');
    expect(spinner).not.toBeNull();
    expect(label).toBeNull();
    expect(regularIcon).toBeNull();

    button?.click();
    expect(clickCount).toBe(0);
  });

  it('shows spinner and optional loadingText while hiding regular text when loading is true', () => {
    fixture.componentRef.setInput('text', 'Save');
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('loadingText', 'Saving...');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const spinner = element.querySelector('.iv-btn__spinner');
    const label = element.querySelector('.iv-btn__label');

    expect(spinner).not.toBeNull();
    expect(label?.textContent).toBe('Saving...');
  });

  it('renders Lucide icon in start and end positions', () => {
    fixture.componentRef.setInput('text', 'Add');
    fixture.componentRef.setInput('icon', Plus);
    fixture.componentRef.setInput('iconPosition', 'start');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const button = element.querySelector('button');
    const childrenStart = Array.from(button?.children ?? []);
    expect(childrenStart[0]?.classList.contains('iv-btn__icon')).toBe(true);
    expect(childrenStart[1]?.classList.contains('iv-btn__label')).toBe(true);

    fixture.componentRef.setInput('iconPosition', 'end');
    fixture.detectChanges();

    const childrenEnd = Array.from(button?.children ?? []);
    expect(childrenEnd[0]?.classList.contains('iv-btn__label')).toBe(true);
    expect(childrenEnd[1]?.classList.contains('iv-btn__icon')).toBe(true);
  });

  it('projects custom HTML content via ng-content', () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();

    const projected = (hostFixture.nativeElement as HTMLElement).querySelector(
      '[data-testid="projected-label"]',
    );
    expect(projected?.textContent).toBe('Projected HTML');
  });
});
