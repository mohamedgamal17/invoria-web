import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  ClipboardList,
  LayoutDashboard,
  LucideAngularModule,
  Package,
  ShoppingBag,
  User,
  Users,
  LogOut,
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
  styleUrls: ['./dashboard-sidebar.component.css']
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

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Products', path: '/dashboard/products', icon: Package },
    { label: 'Orders', path: '/dashboard/orders', icon: ShoppingBag },
    { label: 'Procurement', path: '/dashboard/procurement', icon: ClipboardList },
    { label: 'Suppliers', path: '/dashboard/suppliers', icon: Users },
    { label: 'Customers', path: '/dashboard/customers', icon: User }
  ];

  readonly logoutIcon = LogOut;
  readonly collapseIcon = ChevronLeft;
  readonly expandIcon = ChevronRight;
}
