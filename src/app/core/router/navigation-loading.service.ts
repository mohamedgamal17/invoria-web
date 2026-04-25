import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import {
  Event,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  RouteConfigLoadEnd,
  RouteConfigLoadStart,
  Router
} from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class NavigationLoadingService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  private readonly _isLoading = signal(false);
  readonly isLoading = this._isLoading.asReadonly();

  private showDelayTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private pendingNavigationCount = 0;
  private pendingRouteConfigLoads = 0;

  constructor() {
    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        this.handleRouterEvent(event);
      });
  }

  private handleRouterEvent(event: Event): void {
    if (event instanceof NavigationStart) {
      this.pendingNavigationCount += 1;
      this.updateLoadingState();
      return;
    }

    if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
      this.pendingNavigationCount = Math.max(0, this.pendingNavigationCount - 1);
      this.updateLoadingState();
      return;
    }

    if (event instanceof RouteConfigLoadStart) {
      this.pendingRouteConfigLoads += 1;
      this.updateLoadingState();
      return;
    }

    if (event instanceof RouteConfigLoadEnd) {
      this.pendingRouteConfigLoads = Math.max(0, this.pendingRouteConfigLoads - 1);
      this.updateLoadingState();
    }
  }

  private updateLoadingState(): void {
    const hasPendingRoutingWork = this.pendingNavigationCount > 0 || this.pendingRouteConfigLoads > 0;

    if (hasPendingRoutingWork) {
      if (this._isLoading() || this.showDelayTimeoutId) {
        return;
      }

      this.showDelayTimeoutId = setTimeout(() => {
        this.showDelayTimeoutId = null;

        if (this.pendingNavigationCount > 0 || this.pendingRouteConfigLoads > 0) {
          this._isLoading.set(true);
        }
      }, 150);
      return;
    }

    if (this.showDelayTimeoutId) {
      clearTimeout(this.showDelayTimeoutId);
      this.showDelayTimeoutId = null;
    }

    this._isLoading.set(false);
  }
}
