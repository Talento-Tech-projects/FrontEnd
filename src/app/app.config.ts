import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
<<<<<<< HEAD
=======
import { provideHttpClient, withFetch } from '@angular/common/http';
>>>>>>> elkin

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
<<<<<<< HEAD
    provideRouter(routes), provideClientHydration(withEventReplay())
=======
    provideRouter(routes), provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch())
>>>>>>> elkin
  ]
};
