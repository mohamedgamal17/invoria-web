import { Component } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router, RouterOutlet, Routes } from '@angular/router';

import { DashboardSidebarComponent } from './dashboard-sidebar.component';

@Component({
  imports: [DashboardSidebarComponent, RouterOutlet],
  template: '<app-dashboard-sidebar /><router-outlet />'
})
class SidebarNavTestHost {}

@Component({ template: '' })
class StubPageComponent {}

const routes: Routes = [
  { path: '', pathMatch: 'full', component: StubPageComponent },
  { path: 'products', component: StubPageComponent },
  { path: 'customers', component: StubPageComponent },
  { path: 'customers/:id', component: StubPageComponent }
];

function findNavLinkByLabel(
  fixture: ComponentFixture<SidebarNavTestHost>,
  label: string
): HTMLAnchorElement | undefined {
  const anchors = fixture.nativeElement.querySelectorAll('a');
  return Array.from(anchors as NodeListOf<HTMLAnchorElement>).find((a) =>
    a.textContent?.includes(label)
  );
}

function findGroupToggleButton(
  fixture: ComponentFixture<SidebarNavTestHost>,
  label: string
): HTMLButtonElement | undefined {
  const buttons = fixture.nativeElement.querySelectorAll('button');
  return Array.from(buttons as NodeListOf<HTMLButtonElement>).find((b) =>
    b.textContent?.includes(label)
  );
}

async function settle(fixture: ComponentFixture<SidebarNavTestHost>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

function navLinkClass(
  fixture: ComponentFixture<SidebarNavTestHost>,
  label: string
): string {
  return findNavLinkByLabel(fixture, label)?.className ?? '';
}

describe('DashboardSidebarComponent', () => {
  let fixture: ComponentFixture<SidebarNavTestHost>;
  let router: Router;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [SidebarNavTestHost, StubPageComponent, NoopAnimationsModule],
      providers: [provideRouter(routes)]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarNavTestHost);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('marks Dashboard active on home and not Customers', async () => {
    await router.navigateByUrl('/');
    fixture.detectChanges();

    expect(navLinkClass(fixture, 'Dashboard')).toContain('active');
    expect(navLinkClass(fixture, 'Customers')).not.toContain('active');
  });

  it('auto-expands CRM and marks Customers active when URL has paging query params', async () => {
    await router.navigateByUrl('/customers');
    fixture.detectChanges();
    await router.navigateByUrl('/customers?page=2&pageSize=25');
    fixture.detectChanges();

    expect(findNavLinkByLabel(fixture, 'Customers')).toBeDefined();
    expect(navLinkClass(fixture, 'Customers')).toContain('active');
    expect(navLinkClass(fixture, 'Dashboard')).not.toContain('active');
  });

  it('auto-expands CRM on child detail route without marking parent active', async () => {
    await router.navigateByUrl('/customers/cust_1');
    fixture.detectChanges();

    const customersClass = navLinkClass(fixture, 'Customers');

    expect(customersClass.length).toBeGreaterThan(0);
    expect(customersClass).not.toContain('active');
    expect(navLinkClass(fixture, 'Dashboard')).not.toContain('active');
  });

  it('accordion-collapses the previous group when navigating into another section', async () => {
    await router.navigateByUrl('/products');
    await settle(fixture);
    expect(findNavLinkByLabel(fixture, 'Products')).toBeDefined();

    await router.navigateByUrl('/customers');
    await settle(fixture);

    expect(findNavLinkByLabel(fixture, 'Customers')).toBeDefined();
    expect(findNavLinkByLabel(fixture, 'Products')).toBeUndefined();
  });

  it('opens a group on header click and collapses it on second click', async () => {
    await router.navigateByUrl('/');
    await settle(fixture);

    const inventoryHeader = findGroupToggleButton(fixture, 'Inventory');
    expect(inventoryHeader).toBeDefined();

    inventoryHeader!.click();
    await settle(fixture);
    expect(findNavLinkByLabel(fixture, 'Products')).toBeDefined();

    inventoryHeader!.click();
    await settle(fixture);
    expect(findNavLinkByLabel(fixture, 'Products')).toBeUndefined();
  });

  it('tints the parent header while a child route is active', async () => {
    await router.navigateByUrl('/customers');
    fixture.detectChanges();
    await router.navigateByUrl('/customers?page=2&pageSize=25');
    await settle(fixture);

    const crmHeader = findGroupToggleButton(fixture, 'CRM');
    expect(crmHeader?.className).toContain('active');
    expect(navLinkClass(fixture, 'Customers')).toContain('active');
  });
});
