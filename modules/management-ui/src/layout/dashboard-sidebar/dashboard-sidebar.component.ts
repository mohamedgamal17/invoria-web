import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  type IsActiveMatchOptions,
} from '@angular/router';
import { filter } from 'rxjs';
import { ChevronDown, LucideAngularModule } from 'lucide-angular';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import type { ModuleNavEntry, ModuleNavItem, ModuleNavGroup } from '@invoria/core';
import { MANAGEMENT_NAV_ENTRIES } from '../navigation.config';

type NavItem = ModuleNavItem;
type NavGroup = ModuleNavGroup;
type SidebarEntry = ModuleNavEntry;

@Component({
  selector: 'app-dashboard-sidebar',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule, TooltipModule, RippleModule],
  templateUrl: './dashboard-sidebar.component.html',
  styleUrls: ['./dashboard-sidebar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slide', [
      transition(':enter', [
        style({ height: 0, opacity: 0, overflow: 'hidden' }),
        animate('200ms ease-out', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        style({ overflow: 'hidden' }),
        animate('200ms ease-in', style({ height: 0, opacity: 0 })),
      ]),
    ]),
  ],
})
export class DashboardSidebarComponent {
  readonly collapsed = input(false);
  readonly navigate = output<void>();

  protected readonly user = {
    name: 'Mohamed Gamal',
    email: 'mohamed@invoria.com',
    initials: 'MG',
  };

  protected readonly navSections: readonly SidebarEntry[] = MANAGEMENT_NAV_ENTRIES;

  protected readonly chevronDownIcon = ChevronDown;

  protected readonly expandedGroup = signal<string | null>(null);

  protected readonly activeGroupLabel = signal<string | null>(null);

  private readonly router = inject(Router);

  protected readonly flatItems = computed<NavItem[]>(() =>
    this.navSections.flatMap((section) => ('children' in section ? section.children : [section])),
  );

  constructor() {
    this.syncRouteGroups(this.router.url);
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => this.syncRouteGroups(event.urlAfterRedirects));
  }

  protected toggleGroup(label: string): void {
    this.expandedGroup.update((current) => (current === label ? null : label));
  }

  protected isGroupExpanded(label: string): boolean {
    return this.expandedGroup() === label;
  }

  protected isGroupActive(label: string): boolean {
    return this.activeGroupLabel() === label;
  }

  protected linkActiveOptions(_path: string): IsActiveMatchOptions {
    return {
      paths: 'exact',
      queryParams: 'ignored' as const,
      matrixParams: 'ignored' as const,
      fragment: 'ignored' as const,
    };
  }

  private syncRouteGroups(url: string): void {
    const path = url.split('?')[0].split('#')[0];
    const group = this.findGroupForPath(path);
    this.activeGroupLabel.set(group?.label ?? null);
    if (group) {
      this.expandedGroup.set(group.label);
    }
  }

  private findGroupForPath(path: string): NavGroup | undefined {
    return this.navSections.find(
      (entry): entry is NavGroup =>
        'children' in entry &&
        entry.children.some((child) => child.path === path || path.startsWith(child.path + '/')),
    );
  }
}
