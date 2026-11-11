import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [ButtonModule, CardModule],
  templateUrl: './not-found-page.component.html',
})
export class NotFoundPageComponent {
  private readonly router = inject(Router);

  goDashboard(): void {
    void this.router.navigate(['/']);
  }

  goBack(): void {
    window.history.back();
  }
}
