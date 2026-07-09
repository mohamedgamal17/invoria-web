import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { RouterLink, RouterLinkActive, type IsActiveMatchOptions } from '@angular/router';
import {
  ClipboardList,
  ContactRound,
  LayoutDashboard,
  LucideAngularModule,
  Package,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Undo2,
  User,
  Users,
  Warehouse,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-angular';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

type NavItem = {
  label: string;
  path: string;
  icon: any;
};

type NavGroup = {
  label: string;
  icon: any;
  children: NavItem[];
};

type SidebarEntry = NavItem | NavGroup;

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    LucideAngularModule,
    TooltipModule,
    RippleModule,
    AvatarModule,
    ButtonModule
  ],
  templateUrl: './dashboard-sidebar.component.html',
  styleUrls: ['./dashboard-sidebar.component.css'],
  animations: [
    trigger('slide', [
      transition(':enter', [
        style({ height: 0, opacity: 0, overflow: 'hidden' }),
        animate('200ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ overflow: 'hidden' }),
        animate('200ms ease-in', style({ height: 0, opacity: 0 }))
      ])
    ])
  ]
})
export class DashboardSidebarComponent {
  @Input() collapsed = false;
  @Output() readonly navigate = new EventEmitter<void>();
  @Output() readonly toggleCollapse = new EventEmitter<void>();

  readonly user = {
    name: 'Mohamed gamal',
    email: 'mohamed@invoria.com',
    avatar: 'MG'
  };

  readonly navSections: SidebarEntry[] = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    {
      label: 'Inventory', icon: Warehouse,
      children: [
        { label: 'Products', path: '/products', icon: Package },
        { label: 'Returns', path: '/returns', icon: Undo2 }
      ]
    },
    {
      label: 'Sales', icon: TrendingUp,
      children: [
        { label: 'Orders', path: '/orders', icon: ShoppingBag },
        { label: 'Invoices', path: '/invoices', icon: Receipt }
      ]
    },
    {
      label: 'Procurement', icon: ShoppingCart,
      children: [
        { label: 'Purchase Orders', path: '/procurement', icon: ClipboardList },
        { label: 'Suppliers', path: '/suppliers', icon: Users }
      ]
    },
    {
      label: 'CRM', icon: ContactRound,
      children: [
        { label: 'Customers', path: '/customers', icon: User }
      ]
    }
  ];

  get flatItems(): NavItem[] {
    return this.navSections.flatMap(s => 'children' in s ? s.children : [s]);
  }

  readonly logoutIcon = LogOut;
  readonly collapseIcon = ChevronLeft;
  readonly expandIcon = ChevronRight;
  readonly chevronDownIcon = ChevronDown;

  readonly expandedGroups = signal<Set<string>>(new Set());

  toggleGroup(label: string): void {
    this.expandedGroups.update(set => {
      const next = new Set(set);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }

  isGroupExpanded(label: string): boolean {
    return this.expandedGroups().has(label);
  }

  linkActiveOptions(path: string): IsActiveMatchOptions {
    const ignored = {
      queryParams: 'ignored' as const,
      matrixParams: 'ignored' as const,
      fragment: 'ignored' as const
    };
    if (path === '/') {
      return { paths: 'exact', ...ignored };
    }
    return { paths: 'subset', ...ignored };
  }
}


