import { Routes } from '@angular/router';

import type { ModuleManifest } from '@invoria/core';
import { APP_MODULE_MANIFESTS } from './modules.config';

function buildModuleRoutes(manifests: readonly ModuleManifest[]): Routes {
  return manifests.flatMap((manifest) => manifest.routes);
}

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/dashboard-shell/dashboard-shell.component').then(
        (module) => module.DashboardShellComponent,
      ),
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./dashboard/dashboard.routes').then((module) => module.DASHBOARD_ROUTES),
      },
      ...buildModuleRoutes(APP_MODULE_MANIFESTS),
    ],
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./error-pages/pages/not-found-page/not-found-page.component').then(
        (module) => module.NotFoundPageComponent,
      ),
  },
  {
    path: 'internal-error',
    loadComponent: () =>
      import('./error-pages/pages/internal-error-page/internal-error-page.component').then(
        (module) => module.InternalErrorPageComponent,
      ),
  },
  {
    path: 'service-unavailable',
    loadComponent: () =>
      import('./error-pages/pages/service-unavailable-page/service-unavailable-page.component').then(
        (module) => module.ServiceUnavailablePageComponent,
      ),
  },
  { path: '**', redirectTo: 'not-found' },
];
