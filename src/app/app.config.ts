import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';

import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http'; // ✅ importar withFetch
import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay
} from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
  ]
};