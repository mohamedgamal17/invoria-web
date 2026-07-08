import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, map, take } from 'rxjs';

import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';

import { presentApiError } from '../../../../core/http/api-error.presenter';
import { ReturnsApiService } from '../../services/returns-api.service';
import type { Return } from '../../models/return.entity';
import { ReturnDetailsToolbarComponent } from '../../components/return-details-toolbar/return-details-toolbar.component';
import { ReturnDetailsInfoComponent } from '../../components/return-details-info/return-details-info.component';
import { ReturnDetailsLinesComponent } from '../../components/return-details-lines/return-details-lines.component';

@Component({
  selector: 'app-return-details-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    SkeletonModule,
    ToastModule,
    ReturnDetailsToolbarComponent,
    ReturnDetailsInfoComponent,
    ReturnDetailsLinesComponent
  ],
  providers: [MessageService],
  templateUrl: './return-details-page.component.html'
})
export class ReturnDetailsPageComponent {
  private readonly returnsApi = inject(ReturnsApiService);
  private readonly messageService = inject(MessageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly returnId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' }
  );

  readonly loading = signal(true);
  readonly error = signal('');
  readonly returnData = signal<Return | null>(null);

  constructor() {
    this.loadReturn();
  }

  backToList(): void {
    void this.router.navigate(['/returns']);
  }

  retry(): void {
    this.loadReturn();
  }

  private loadReturn(): void {
    const id = this.returnId();
    if (!id) {
      this.loading.set(false);
      this.returnData.set(null);
      this.error.set('Missing return id.');
      this.messageService.add({ severity: 'error', summary: 'Error', detail: this.error() });
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.returnData.set(null);

    this.returnsApi
      .getReturn(id)
      .pipe(
        take(1),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (res) => {
          if (!res.isSuccess || !res.result) {
            const presentation = presentApiError(res.error);
            const detail = presentation.toast.detail ?? 'Failed to load return.';
            this.error.set(detail);
            this.returnData.set(null);
            this.messageService.add(presentation.toast);
            if (presentation.routeTarget) {
              void this.router.navigate([presentation.routeTarget]);
            }
            return;
          }
          this.returnData.set(res.result);
        },
        error: (err: unknown) => {
          const presentation = presentApiError(err);
          const detail = presentation.toast.detail ?? 'Failed to load return.';
          this.error.set(detail);
          this.returnData.set(null);
          this.messageService.add(presentation.toast);
          if (presentation.routeTarget) {
            void this.router.navigate([presentation.routeTarget]);
          }
        }
      });
  }
}
