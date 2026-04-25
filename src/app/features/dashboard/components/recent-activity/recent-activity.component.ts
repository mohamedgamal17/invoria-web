import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

type ActivityItem = {
  id: string;
  title: string;
  meta: string;
};

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './recent-activity.component.html'
})
export class RecentActivityComponent {
  private readonly router = inject(Router);

  readonly items: ActivityItem[] = [
    { id: 'a1', title: 'Order #1042 created', meta: '2 min ago • Sales' },
    { id: 'a2', title: 'Stock received for Item “SKU-AX21”', meta: '18 min ago • Inventory' },
    { id: 'a3', title: 'Customer record updated', meta: '1 hr ago • Customers' },
    { id: 'a4', title: 'Order #1038 shipped', meta: '3 hr ago • Logistics' }
  ];

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }
}

