import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IvLabelComponent } from '../label';
import { IvFloatLabelComponent } from './index';

@Component({
  standalone: true,
  imports: [IvFloatLabelComponent, IvLabelComponent],
  template: `
    <iv-float-label variant="on" styleClass="custom-float">
      <input id="email-field" type="text" />
      <iv-label htmlFor="email-field" text="Email" />
    </iv-float-label>
  `,
})
class TestHostComponent {}

@Component({
  standalone: true,
  imports: [IvFloatLabelComponent],
  template: `
    <iv-float-label variant="over">
      <input id="prefilled-field" type="text" value="jane@invoria.app" />
      <label for="prefilled-field">Email</label>
    </iv-float-label>
  `,
})
class PrefilledHostComponent {}

describe('IvFloatLabelComponent', () => {
  let fixture: ComponentFixture<IvFloatLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IvFloatLabelComponent, TestHostComponent, PrefilledHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IvFloatLabelComponent);
  });

  it('defaults to over variant class', () => {
    fixture.detectChanges();

    const wrapper = (fixture.nativeElement as HTMLElement).querySelector('.iv-float-label');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.classList.contains('iv-float-label--over')).toBe(true);
  });

  it('applies in, on, and over variant classes and styleClass', () => {
    fixture.componentRef.setInput('variant', 'in');
    fixture.componentRef.setInput('styleClass', 'extra-class');
    fixture.detectChanges();

    const wrapper = (fixture.nativeElement as HTMLElement).querySelector('.iv-float-label');
    expect(wrapper?.classList.contains('iv-float-label--in')).toBe(true);
    expect(wrapper?.classList.contains('extra-class')).toBe(true);

    fixture.componentRef.setInput('variant', 'on');
    fixture.detectChanges();
    expect(wrapper?.classList.contains('iv-float-label--on')).toBe(true);
    expect(wrapper?.classList.contains('iv-float-label--in')).toBe(false);
  });

  it('projects input and iv-label children', () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();

    const hostElement = hostFixture.nativeElement as HTMLElement;
    const wrapper = hostElement.querySelector('.iv-float-label');
    const inputElement = hostElement.querySelector('input#email-field');
    const labelElement = hostElement.querySelector('iv-label label');

    expect(wrapper?.classList.contains('iv-float-label--on')).toBe(true);
    expect(wrapper?.classList.contains('custom-float')).toBe(true);
    expect(inputElement).not.toBeNull();
    expect(labelElement?.textContent).toContain('Email');
    expect(labelElement?.getAttribute('for')).toBe('email-field');
  });

  it('toggles iv-float-label--filled when input value changes', () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();

    const hostElement = hostFixture.nativeElement as HTMLElement;
    const wrapper = hostElement.querySelector('.iv-float-label');
    const inputElement = hostElement.querySelector<HTMLInputElement>('input#email-field');

    expect(wrapper?.classList.contains('iv-float-label--filled')).toBe(false);

    if (!inputElement) {
      throw new Error('Expected input#email-field to exist');
    }

    inputElement.value = 'alice@invoria.app';
    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    hostFixture.detectChanges();

    expect(wrapper?.classList.contains('iv-float-label--filled')).toBe(true);

    inputElement.value = '';
    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    hostFixture.detectChanges();

    expect(wrapper?.classList.contains('iv-float-label--filled')).toBe(false);
  });

  it('marks prefilled inputs as iv-float-label--filled on initialization', () => {
    const hostFixture = TestBed.createComponent(PrefilledHostComponent);
    hostFixture.detectChanges();

    const wrapper = (hostFixture.nativeElement as HTMLElement).querySelector('.iv-float-label');
    expect(wrapper?.classList.contains('iv-float-label--filled')).toBe(true);
  });
});
