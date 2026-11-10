import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import {
  DASHBOARD_FEATURE_KEY,
  dashboardReducer,
} from './store/dashboard/dashboard.reducer';
import { DashboardEffects } from './store/dashboard/dashboard.effects';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    // Dashboard slice lives on the page route scope: fresh state per visit,
    // matching the previous component-init fetch behavior.
    providers: [
      provideState(DASHBOARD_FEATURE_KEY, dashboardReducer),
      provideEffects(DashboardEffects),
    ],
    loadComponent: () =>
      import('./pages/dashboard-page/dashboard-page.component').then(
        (module) => module.DashboardPageComponent
      )
  }
];
