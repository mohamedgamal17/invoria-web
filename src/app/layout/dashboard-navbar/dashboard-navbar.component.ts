import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import {
  ChevronDown,
  LucideAngularModule,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Sun
} from 'lucide-angular';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';

import { ThemeService } from '../../core/theme/theme.service';

@Component({
  selector: 'app-dashboard-navbar',
  imports: [LucideAngularModule, MenuModule],
  templateUrl: './dashboard-navbar.component.html',
  styleUrl: './dashboard-navbar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardNavbarComponent {
  readonly collapsed = input(false);
  readonly menuClick = output<void>();
  readonly collapseToggle = output<void>();

  protected readonly theme = inject(ThemeService);

  protected readonly isUserMenuVisible = signal(false);

  protected readonly user = {
    name: 'Mohamed Gamal',
    email: 'mohamed@invoria.com',
    initials: 'MG'
  };

  protected readonly userMenuItems: MenuItem[] = [
    { label: 'Profile', icon: 'pi pi-user' },
    { label: 'Settings', icon: 'pi pi-cog' },
    { separator: true },
    { label: 'Log out', icon: 'pi pi-sign-out', styleClass: 'text-danger' }
  ];

  protected readonly menuIcon = Menu;
  protected readonly panelLeftCloseIcon = PanelLeftClose;
  protected readonly panelLeftOpenIcon = PanelLeftOpen;
  protected readonly sunIcon = Sun;
  protected readonly moonIcon = Moon;
  protected readonly chevronDownIcon = ChevronDown;
}
