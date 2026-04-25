import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [ButtonModule, CardModule],
  template: `
    <section class="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center p-6">
      <p-card styleClass="w-full border border-border/70 text-center shadow-sm">
        <div class="space-y-4 py-4">
          <p class="text-xs font-bold uppercase tracking-wider text-muted-foreground">404</p>
          <h1 class="text-3xl font-bold text-foreground">Page not found</h1>
          <p class="text-sm text-muted-foreground">
            The page you are looking for does not exist or may have been moved.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
            <p-button label="Go to Dashboard" icon="pi pi-home" (onClick)="goDashboard()" />
            <p-button label="Go Back" icon="pi pi-arrow-left" [outlined]="true" (onClick)="goBack()" />
          </div>
        </div>
      </p-card>
    </section>
  `
})
export class NotFoundPageComponent {
  private readonly router = inject(Router);

  goDashboard(): void {
    void this.router.navigate(['/dashboard']);
  }

  goBack(): void {
    window.history.back();
  }
}
