import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-service-unavailable-page',
  standalone: true,
  imports: [ButtonModule, CardModule],
  templateUrl: './service-unavailable-page.component.html',
})
export class ServiceUnavailablePageComponent {
  private readonly router = inject(Router);

  retry(): void {
    window.location.reload();
  }

  goDashboard(): void {
    void this.router.navigate(['/']);
  }
}
