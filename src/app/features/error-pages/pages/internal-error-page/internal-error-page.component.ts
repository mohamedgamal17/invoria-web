import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-internal-error-page',
  standalone: true,
  imports: [ButtonModule, CardModule],
  templateUrl: './internal-error-page.component.html',
})
export class InternalErrorPageComponent {
  private readonly router = inject(Router);

  retry(): void {
    window.location.reload();
  }

  goDashboard(): void {
    void this.router.navigate(['/']);
  }
}
