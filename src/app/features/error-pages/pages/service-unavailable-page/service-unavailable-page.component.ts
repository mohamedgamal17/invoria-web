import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-service-unavailable-page',
  standalone: true,
  imports: [ButtonModule, CardModule],
  template: `
    <section class="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center p-6">
      <p-card styleClass="w-full border border-border/70 text-center shadow-sm">
        <div class="space-y-4 py-4">
          <p class="text-xs font-bold uppercase tracking-wider text-muted-foreground">503</p>
          <h1 class="text-3xl font-bold text-foreground">Service unavailable</h1>
          <p class="text-sm text-muted-foreground">
            The API is unavailable or your internet connection is offline. Please check your
            connection and try again.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
            <p-button label="Retry" icon="pi pi-refresh" (onClick)="retry()" />
            <p-button
              label="Go to Dashboard"
              icon="pi pi-home"
              [outlined]="true"
              (onClick)="goDashboard()"
            />
          </div>
        </div>
      </p-card>
    </section>
  `
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
