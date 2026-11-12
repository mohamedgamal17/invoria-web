import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';

import { provideStore, provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import {
  DEFAULT_ROUTER_FEATURENAME,
  provideRouterStore,
  routerReducer,
  RouterState
} from '@ngrx/router-store';
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import AuraInvoria from '../styles/primeng/aura.preset';
import { provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

import { apiResponseInterceptor } from './core/http/api-response.interceptor';
import { AppErrorEffects } from './shared/store/app-error.effects';

echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, CanvasRenderer]);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([apiResponseInterceptor])),
    provideAnimationsAsync(),
    // Root-provided so `p-toast` and the global `AppErrorEffects` share one instance.
    MessageService,
    // Root-provided single instance behind the shared `ConfirmDialogService`
    // and the `<app-confirm-dialog>` host in `app.html`.
    ConfirmationService,
    // Global error presentation (toast + error-route navigation) for any feature flow.
    provideStore({}),
    // Router slice the router-store selectors read from (`state['router'].state`).
    provideState(DEFAULT_ROUTER_FEATURENAME, routerReducer),
    provideEffects(AppErrorEffects),
    // Feeds the router state (url/params/queryParams only) into the store so
    // feature state modules can react to the URL instead of the components.
    provideRouterStore({ routerState: RouterState.Minimal }),
    providePrimeNG({
      theme: {
        preset: AuraInvoria,
        options: {
          // PrimeNG uses `--p-*` CSS variables by default. Keep it consistent with its docs.
          prefix: 'p',
          // Your app toggles `.dark` on the document root, so we bind PrimeNG dark tokens to the same selector.
          darkModeSelector: '.dark'
        }
      }
    }),
    provideRouter(routes),
    provideEchartsCore({ echarts })
  ]
};
