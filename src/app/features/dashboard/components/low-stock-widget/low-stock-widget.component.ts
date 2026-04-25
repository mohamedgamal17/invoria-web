import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';

type LowStockItem = {
  id: string;
  name: string;
  sku: string;
  onHand: number;
  reorderAt: number;
};

@Component({
  selector: 'app-low-stock-widget',
  standalone: true,
  imports: [BadgeModule, ButtonModule],
  templateUrl: './low-stock-widget.component.html'
})
export class LowStockWidgetComponent {
  private readonly router = inject(Router);

  readonly items: LowStockItem[] = [
    { id: 's1', name: 'Packing tape', sku: 'PK-TAPE-01', onHand: 12, reorderAt: 20 },
    { id: 's2', name: 'Shipping box (M)', sku: 'BOX-M-10', onHand: 8, reorderAt: 15 },
    { id: 's3', name: 'Label paper roll', sku: 'LBL-ROLL-02', onHand: 3, reorderAt: 10 },
    { id: 's4', name: 'Gloves (L)', sku: 'GLV-L-50', onHand: 9, reorderAt: 25 }
  ];

  goToInventory(): void {
    this.router.navigate(['/inventory']);
  }
}

