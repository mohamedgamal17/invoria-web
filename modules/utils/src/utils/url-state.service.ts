import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import type { Params } from '@angular/router';

/**
 * Shared URL query-state helpers. Methods accept the route-scoped
 * {@link ActivatedRoute} since it cannot be injected from the root injector.
 */
@Injectable({ providedIn: 'root' })
export class UrlStateService {
  private readonly router = inject(Router);

  /** Replaces the current URL, setting the given query params. */
  async replaceQueryParams(
    route: ActivatedRoute,
    queryParams: Params
  ): Promise<boolean> {
    return this.router.navigate([], {
      relativeTo: route,
      replaceUrl: true,
      queryParams
    });
  }

  /** Navigates adding/merging the given query params. */
  async mergeQueryParams(
    route: ActivatedRoute,
    queryParams: Params
  ): Promise<boolean> {
    return this.router.navigate([], {
      relativeTo: route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }
}
