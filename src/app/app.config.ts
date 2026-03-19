import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';

import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import AuraInvoria from '../styles/primeng/aura.preset';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimationsAsync(),
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
    provideRouter(routes)
  ]
};
