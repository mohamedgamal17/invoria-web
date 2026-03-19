import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { DashboardNavbarComponent } from '../dashboard-navbar/dashboard-navbar.component';
import { DashboardSidebarComponent } from '../dashboard-sidebar/dashboard-sidebar.component';

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [RouterOutlet, DashboardNavbarComponent, DashboardSidebarComponent],
  templateUrl: './dashboard-shell.component.html'
})
export class DashboardShellComponent {
  readonly isMobileSidebarOpen = signal(false);
  readonly isSidebarCollapsed = signal(false);

  openMobileSidebar(): void {
    this.isMobileSidebarOpen.set(true);
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen.set(false);
  }

  toggleSidebarCollapsed(): void {
    this.isSidebarCollapsed.update((value) => !value);
  }
}

