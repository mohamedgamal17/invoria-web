import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './quick-actions.component.html'
})
export class QuickActionsComponent {
  private readonly router = inject(Router);

  go(path: string): void {
    this.router.navigate([path]);
  }
}

