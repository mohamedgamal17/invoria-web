import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavigationLoadingService } from '../../core/router/navigation-loading.service';
import { DashboardNavbarComponent } from '../dashboard-navbar/dashboard-navbar.component';
import { DashboardSidebarComponent } from '../dashboard-sidebar/dashboard-sidebar.component';

@Component({
  selector: 'app-dashboard-shell',
  imports: [RouterOutlet, DashboardNavbarComponent, DashboardSidebarComponent],
  templateUrl: './dashboard-shell.component.html',
  styleUrl: './dashboard-shell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'closeMobileSidebar()'
  }
})
export class DashboardShellComponent {
  readonly isMobileSidebarOpen = signal(false);
  readonly isSidebarCollapsed = signal(false);
  readonly navigationLoading = inject(NavigationLoadingService);

  openMobileSidebar(): void {
    if (!this.isMobileSidebarOpen() && typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
    this.isMobileSidebarOpen.set(true);
  }

  closeMobileSidebar(): void {
    if (!this.isMobileSidebarOpen()) {
      return;
    }
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
    this.isMobileSidebarOpen.set(false);
  }

  toggleSidebarCollapsed(): void {
    this.isSidebarCollapsed.update((value) => !value);
  }
}
