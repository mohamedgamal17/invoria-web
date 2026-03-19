import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChevronLeft, ChevronRight, LucideAngularModule, Menu, User } from 'lucide-angular';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-dashboard-navbar',
  standalone: true,
  imports: [LucideAngularModule, ButtonModule, InputTextModule],
  templateUrl: './dashboard-navbar.component.html'
})
export class DashboardNavbarComponent {
  @Input() collapsed = false;
  @Output() readonly menuClick = new EventEmitter<void>();
  @Output() readonly collapseToggle = new EventEmitter<void>();

  readonly menuIcon = Menu;
  readonly collapseIconExpanded = ChevronLeft;
  readonly collapseIconCollapsed = ChevronRight;
  readonly userIcon = User;
}
