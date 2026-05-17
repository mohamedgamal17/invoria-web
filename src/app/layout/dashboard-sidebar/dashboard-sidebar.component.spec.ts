import { Component } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router, RouterOutlet, Routes } from '@angular/router';

import { DashboardSidebarComponent } from './dashboard-sidebar.component';

@Component({
  standalone: true,
  imports: [DashboardSidebarComponent, RouterOutlet],
  template: '<app-dashboard-sidebar /><router-outlet />'
})
class SidebarNavTestHost {}

@Component({ standalone: true, template: '' })
class StubPageComponent {}

const routes: Routes = [
  { path: '', pathMatch: 'full', component: StubPageComponent },
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

    expect(findNavLinkByLabel(fixture, 'Dashboard')?.className).toContain('active');
    expect(findNavLinkByLabel(fixture, 'Customers')?.className).not.toContain('active');
  });

  it('marks Customers active when URL has paging query params', async () => {
    await router.navigateByUrl('/customers?page=2&pageSize=25');
    fixture.detectChanges();

    expect(findNavLinkByLabel(fixture, 'Customers')?.className).toContain('active');
    expect(findNavLinkByLabel(fixture, 'Dashboard')?.className).not.toContain('active');
  });

  it('marks Customers active on child detail route', async () => {
    await router.navigateByUrl('/customers/cust_1');
    fixture.detectChanges();

    expect(findNavLinkByLabel(fixture, 'Customers')?.className).toContain('active');
    expect(findNavLinkByLabel(fixture, 'Dashboard')?.className).not.toContain('active');
  });
});
