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

describe('DashboardSidebarComponent', () => {
  let fixture: ComponentFixture<SidebarNavTestHost>;
  let router: Router;

  function sidebar(): DashboardSidebarComponent {
    const debug = fixture.debugElement.children.find((child) => child.componentInstance instanceof DashboardSidebarComponent);
    return debug!.componentInstance as DashboardSidebarComponent;
  }

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

  it('toggles expanded group via toggleGroup', async () => {
    const sidebarInstance = sidebar();
    expect(sidebarInstance['isGroupExpanded']('Inventory')).toBe(false);
    sidebarInstance['toggleGroup']('Inventory');
    expect(sidebarInstance['isGroupExpanded']('Inventory')).toBe(true);
    expect(sidebarInstance['expandedGroup']()).toBe('Inventory');
    sidebarInstance['toggleGroup']('Inventory');
    expect(sidebarInstance['isGroupExpanded']('Inventory')).toBe(false);
    expect(sidebarInstance['expandedGroup']()).toBeNull();
  });

  it('auto-expands CRM when navigating to customers route', async () => {
    await router.navigateByUrl('/customers');
    fixture.detectChanges();
    await fixture.whenStable();
    const sidebarInstance = sidebar();
    expect(sidebarInstance['expandedGroup']()).toBe('CRM');
    expect(sidebarInstance['activeGroupLabel']()).toBe('CRM');
    expect(sidebarInstance['isGroupActive']('CRM')).toBe(true);
    expect(sidebarInstance['isGroupExpanded']('CRM')).toBe(true);
  });

  it('keeps query params ignored for active group detection', async () => {
    await router.navigateByUrl('/customers?page=2&pageSize=25');
    fixture.detectChanges();
    await fixture.whenStable();
    const sidebarInstance = sidebar();
    expect(sidebarInstance['activeGroupLabel']()).toBe('CRM');
    expect(sidebarInstance['isGroupActive']('CRM')).toBe(true);
  });

  it('expands parent group on child detail route and keeps it active', async () => {
    await router.navigateByUrl('/customers/cust_1');
    fixture.detectChanges();
    await fixture.whenStable();
    const sidebarInstance = sidebar();
    expect(sidebarInstance['expandedGroup']()).toBe('CRM');
    expect(sidebarInstance['activeGroupLabel']()).toBe('CRM');
    expect(sidebarInstance['isGroupExpanded']('CRM')).toBe(true);
  });

  it('accordion behavior - navigating to another group updates expandedGroup', async () => {
    await router.navigateByUrl('/products');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(sidebar()['expandedGroup']()).toBe('Inventory');

    await router.navigateByUrl('/customers');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(sidebar()['expandedGroup']()).toBe('CRM');
  });

  it('reports isGroupActive correctly for non-active group', async () => {
    await router.navigateByUrl('/');
    fixture.detectChanges();
    await fixture.whenStable();
    const sidebarInstance = sidebar();
    expect(sidebarInstance['activeGroupLabel']()).toBeNull();
    expect(sidebarInstance['isGroupActive']('CRM')).toBe(false);
    expect(sidebarInstance['isGroupActive']('Inventory')).toBe(false);
  });
});
